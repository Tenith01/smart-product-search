import * as fs from 'fs';
import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { ProductsModule } from '../products/products.module';
import { SearchModule } from './search.module';
import { SearchService } from './search.service';
import { Product, ProductDocument } from '../products/products.schema';

/**
 * Full-stack search pipeline against data from `data/products.json` (in-memory MongoDB).
 * Covers assessment example: typo `samsng` → catalog token `samsung` and non-empty results.
 */
describe('SearchService integration', () => {
  let mongod: MongoMemoryServer;
  let moduleRef: TestingModule;
  let searchService: SearchService;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        ProductsModule,
        SearchModule,
      ],
    }).compile();

    searchService = moduleRef.get(SearchService);
    const productModel = moduleRef.get<Model<ProductDocument>>(
      getModelToken(Product.name),
    );

    const dataPath = path.join(process.cwd(), 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as unknown[];
    await productModel.insertMany(productsData);
    await productModel.syncIndexes();

    await searchService.onApplicationBootstrap();
  }, 60_000);

  afterAll(async () => {
    await moduleRef.close();
    await mongod.stop();
  });

  it('maps samsng → samsung and returns Samsung-related products', async () => {
    const result = await searchService.search('samsng');

    expect(result.typoDetected).toBe(true);
    expect(result.correctedQuery.toLowerCase()).toContain('samsung');
    expect(result.topResults.length).toBeGreaterThan(0);

    const matchesSamsung = result.topResults.some(
      (p) =>
        p.name.toLowerCase().includes('samsung') ||
        p.description.toLowerCase().includes('samsung'),
    );
    expect(matchesSamsung).toBe(true);
  });
});
