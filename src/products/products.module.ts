import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductLocationSyncService } from './services/product-location-sync.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/products-entity';
import { ProductImage } from './entities/product-image-entity';
import { Review } from './entities/product-review-entity';
import { Farmer } from 'src/farmers/entities/farmer.entities';
import { Retailer } from 'src/retailers/entities/retailer.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      Review,
      Farmer,
      Retailer,
    ]),
  ],
  providers: [ProductsService, ProductLocationSyncService],
  controllers: [ProductsController],
  exports: [ProductsService, ProductLocationSyncService],
})
export class ProductsModule {}
