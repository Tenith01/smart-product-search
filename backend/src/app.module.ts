import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { SearchModule } from './search/search.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [ProductsModule, SearchModule, SeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
