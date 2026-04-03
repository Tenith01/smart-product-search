import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './products.schema';

export interface ProductsFilter {
  limit?: number;
  page?: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(filter: ProductsFilter = {}) {
    const { limit = 20, page = 1 } = filter;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel.find().skip(skip).limit(limit).lean().exec(),
      this.productModel.countDocuments(),
    ]);
    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
