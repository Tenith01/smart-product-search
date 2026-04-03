import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/products.schema';
import { TokenDictionary } from './utils/token-dict';
import { tokenize, normalise } from './utils/tokenizer';

export interface ProductResult {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  inStock: boolean;
  score: number;
}

export interface SearchResponse {
  query: string;
  correctedQuery: string;
  typoDetected: boolean;
  topResults: ProductResult[];
  byCategory: Record<string, ProductResult[]>;
  totalCount: number;
}

@Injectable()
export class SearchService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SearchService.name);
  private tokenDict: TokenDictionary;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {
    this.tokenDict = new TokenDictionary();
  }

  async onApplicationBootstrap() {
    this.logger.log('Building search token dictionary...');
    const products = await this.productModel
      .find({}, 'name tags description category')
      .lean()
      .exec();

    const names = products.map((p) => p.name as string);
    const tags = products.map((p) => (p.tags as string[]) || []);
    const descriptions = products.map((p) => p.description as string);
    const categories = products.map((p) => p.category as string);

    this.tokenDict.build(names, tags, descriptions, categories);
    this.logger.log('Token dictionary built successfully.');
  }

  async search(query: string): Promise<SearchResponse> {
    const tokens = tokenize(query);
    if (!tokens.length) {
      return this.emptyResponse(query);
    }

    let typoDetected = false;
    const correctedTokens = tokens.map((token) => {
      const match = this.tokenDict.findClosestToken(token);
      if (match.isTypo) typoDetected = true;
      return match.corrected;
    });

    const correctedQuery = correctedTokens.join(' ');
    const phrase = correctedTokens.join(' ');

    let candidates = await this.productModel
      .find(
        { $text: { $search: correctedQuery } },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .lean()
      .exec();

    if (candidates.length === 0) {
      const regexConditions = correctedTokens.map((token) => ({
        $or: [
          { name: { $regex: new RegExp(escapeRegex(token), 'i') } },
          { tags: { $regex: new RegExp(escapeRegex(token), 'i') } },
          { description: { $regex: new RegExp(escapeRegex(token), 'i') } },
        ],
      }));

      candidates = await this.productModel
        .find({ $and: regexConditions })
        .lean()
        .exec();

      for (const item of candidates) {
        (item as { score?: number }).score = 0.5;
      }
    }

    const rankedResults: ProductResult[] = candidates.map((c: Product & { score?: number }) => {
      const textScore = c.score ?? 0;

      const normalizedName = normalise(c.name);
      const normalizedDesc = normalise(c.description);
      const normalizedCategory = normalise(c.category);

      let nameMatch = false;
      for (const token of correctedTokens) {
        if (normalizedName.includes(token)) {
          nameMatch = true;
          break;
        }
      }

      const exactPhraseMatch =
        phrase.length > 0 && normalizedName === phrase ? 1 : 0;

      const namePrefixBoost =
        correctedTokens.length > 0 &&
        normalizedName.startsWith(correctedTokens[0])
          ? 1
          : 0;

      let tagMatchCount = 0;
      for (const tag of c.tags || []) {
        const normalizedTag = normalise(tag);
        for (const token of correctedTokens) {
          if (normalizedTag.includes(token)) tagMatchCount++;
        }
      }

      let descMatchCount = 0;
      for (const token of correctedTokens) {
        if (normalizedDesc.includes(token)) descMatchCount++;
      }

      let categoryMatch = false;
      for (const token of correctedTokens) {
        if (normalizedCategory.includes(token)) {
          categoryMatch = true;
          break;
        }
      }

      const finalScore =
        textScore * 4.0 +
        (nameMatch ? 3.0 : 0) +
        exactPhraseMatch * 5.0 +
        namePrefixBoost * 1.5 +
        tagMatchCount * 1.5 +
        descMatchCount * 0.9 +
        (categoryMatch ? 1.2 : 0) +
        (c.rating / 5) * 2.0 +
        (c.stock > 0 ? 1.0 : -2.0);

      return {
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        price: c.price,
        rating: c.rating,
        stock: c.stock,
        inStock: c.stock > 0,
        score: parseFloat(finalScore.toFixed(2)),
      };
    });

    rankedResults.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

    const totalCount = rankedResults.length;
    const topResults = rankedResults.slice(0, 5);
    const byCategory: Record<string, ProductResult[]> = {};

    const remaining = rankedResults.slice(5);
    for (const item of remaining) {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      if (byCategory[item.category].length < 4) {
        byCategory[item.category].push(item);
      }
    }

    return {
      query,
      correctedQuery,
      typoDetected,
      topResults,
      byCategory,
      totalCount,
    };
  }

  private emptyResponse(query: string): SearchResponse {
    return {
      query,
      correctedQuery: query,
      typoDetected: false,
      topResults: [],
      byCategory: {},
      totalCount: 0,
    };
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
