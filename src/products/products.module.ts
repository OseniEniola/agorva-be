import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/products-entity';
import { ProductImage } from './entities/product-image-entity';
import { Review } from './entities/product-review-entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([Product, ProductImage, Review]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService]
})
export class ProductsModule {}
