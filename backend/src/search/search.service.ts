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
    const products = await this.productModel.find({}, 'name tags').lean().exec();
    
    const names = products.map((p) => p.name as string);
    const tags = products.map((p) => (p.tags as string[]) || []);
    
    this.tokenDict.build(names, tags);
    this.logger.log('Token dictionary built successfully.');
  }

  async search(query: string): Promise<SearchResponse> {
    const tokens = tokenize(query);
    if (!tokens.length) {
      return this.emptyResponse(query);
    }

    // Fuzzy token correction
    let typoDetected = false;
    const correctedTokens = tokens.map((token) => {
      const match = this.tokenDict.findClosestToken(token);
      if (match.isTypo) typoDetected = true;
      return match.corrected;
    });

    const correctedQuery = correctedTokens.join(' ');

    // Primary Text Search
    let candidates = await this.productModel
      .find(
        { $text: { $search: correctedQuery } },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .lean()
      .exec();

    // Fallback if no results or scores are extremely low
    if (candidates.length === 0 || (candidates[0] as any).score < 0.5) {
      const regexConditions = correctedTokens.map((token) => ({
        $or: [
          { name: { $regex: new RegExp(token, 'i') } },
          { tags: { $regex: new RegExp(token, 'i') } },
        ],
      }));

      const fallbackResults = await this.productModel
        .find({ $and: regexConditions })
        .lean()
        .exec();

      // Deduplicate with existing candidates
      const seen = new Set(candidates.map((c) => c.id));
      for (const item of fallbackResults) {
        if (!seen.has(item.id as string)) {
          (item as any).score = 0.5; // assign nominal score for fallback
          candidates.push(item as any);
        }
      }
    }

    // Rank candidates
    const rankedResults: ProductResult[] = candidates.map((c: any) => {
      const textScore = c.score || 0;
      
      const normalizedName = normalise(c.name);
      let nameMatch = false;
      for (const token of correctedTokens) {
        if (normalizedName.includes(token)) {
          nameMatch = true;
          break;
        }
      }

      let tagMatchCount = 0;
      for (const tag of c.tags || []) {
        const normalizedTag = normalise(tag);
        for (const token of correctedTokens) {
          if (normalizedTag.includes(token)) tagMatchCount++;
        }
      }

      const finalScore =
        textScore * 4.0 +
        (nameMatch ? 3.0 : 0) +
        tagMatchCount * 1.5 +
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

    // Sort descending by finalScore
    rankedResults.sort((a, b) => b.score - a.score);

    const totalCount = rankedResults.length;
    const topResults = rankedResults.slice(0, 5);
    const byCategory: Record<string, ProductResult[]> = {};

    // Group the rest by category
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
