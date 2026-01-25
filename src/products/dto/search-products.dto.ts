import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsBoolean,
  IsString,
} from 'class-validator';
import {
  ProductCategory,
  ProductStatus,
  CertificationType,
  ProductCondition,
  ProductOrigin,
} from 'src/common/enums/products-enum';

export enum SearchSortBy {
  DISTANCE = 'distance',
  PRICE_LOW_TO_HIGH = 'price_asc',
  PRICE_HIGH_TO_LOW = 'price_desc',
  RATING = 'rating',
  NEWEST = 'newest',
  POPULAR = 'popular',
}

export class SearchProductsDto {
  @ApiProperty({
    description: 'User latitude for location-based search',
    example: 40.7128,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'User longitude for location-based search',
    example: -74.006,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({
    description: 'Search radius in kilometers',
    example: 50,
    default: 50,
    minimum: 1,
    maximum: 500,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  radiusKm?: number = 50;

  @ApiPropertyOptional({
    description: 'Search query for product name or description',
    example: 'organic tomatoes',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Filter by product category',
    enum: ProductCategory,
  })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({
    description: 'Filter by certifications',
    enum: CertificationType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CertificationType, { each: true })
  certifications?: CertificationType[];

  @ApiPropertyOptional({
    description: 'Filter by product condition',
    enum: ProductCondition,
  })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @ApiPropertyOptional({
    description: 'Filter by product origin',
    enum: ProductOrigin,
  })
  @IsOptional()
  @IsEnum(ProductOrigin)
  origin?: ProductOrigin;

  @ApiPropertyOptional({
    description: 'Filter by seller type',
    enum: ['farmer', 'retailer'],
  })
  @IsOptional()
  @IsEnum(['farmer', 'retailer'])
  sellerType?: 'farmer' | 'retailer';

  @ApiPropertyOptional({
    description: 'Minimum price',
    example: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price',
    example: 1000,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Only show products that offer delivery to user location',
    default: false,
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  deliveryAvailable?: boolean = false;

  @ApiPropertyOptional({
    description: 'Only show products available for pickup',
    default: false,
  })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  pickupOnly?: boolean = false;

  @ApiPropertyOptional({
    description: 'Minimum average rating (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Sort results by',
    enum: SearchSortBy,
    default: SearchSortBy.DISTANCE,
  })
  @IsOptional()
  @IsEnum(SearchSortBy)
  sortBy?: SearchSortBy = SearchSortBy.DISTANCE;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
