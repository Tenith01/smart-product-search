import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/products.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking database seed status...');
    const count = await this.productModel.countDocuments();
    
    if (count > 0) {
      this.logger.log(`Database already seeded with ${count} products.`);
      return;
    }

    this.logger.log('Database empty. Seeding products...');
    try {
      const dataPath = path.join(process.cwd(), 'data', 'products.json');
      const productsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      
      await this.productModel.insertMany(productsData, { ordered: false });
      this.logger.log(`Successfully seeded ${productsData.length} products.`);
    } catch (error) {
      this.logger.error('Failed to seed database:', error);
    }
  }
}
