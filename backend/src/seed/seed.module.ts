import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [SeedService],
})
export class SeedModule {}
