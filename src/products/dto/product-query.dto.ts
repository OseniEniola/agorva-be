import { IsOptional, IsEnum, IsNumber, IsString, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { ProductCategory, ProductCondition, ProductOrigin, ProductStatus } from 'src/common/enums/products-enum';

export class ProductQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsEnum(ProductOrigin)
  origin?: ProductOrigin;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  farmerId?: string;

  @IsOptional()
  @IsString()
  sellerType?: 'farmer' | 'retailer';

  @IsOptional()
  @IsString()
  sortBy?: string; // price, createdAt, name, rating

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  halal?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  kosher?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  organic?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  localOnly?: boolean; // Only show local products

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  imperfectProduce?: boolean; // Show discounted imperfect products
}
