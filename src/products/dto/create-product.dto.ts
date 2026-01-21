import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProductCategory,
  ProductStatus,
  UnitType,
  CertificationType,
  ProductCondition,
  StorageType,
  ShippingMethod,
  ProductOrigin,
} from 'src/common/enums/products-enum';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsEnum(UnitType)
  unit: UnitType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOrderQuantity?: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(CertificationType, { each: true })
  certifications?: CertificationType[];

  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;

  @IsOptional()
  @IsString()
  conditionNotes?: string;

  @IsOptional()
  @IsString()
  originLocation?: string;

  @IsOptional()
  @IsEnum(ProductOrigin)
  origin?: ProductOrigin;

  @IsOptional()
  @IsEnum(StorageType)
  storageType?: StorageType;

  @IsOptional()
  @IsBoolean()
  requiresRefrigeration?: boolean;

  @IsOptional()
  @IsEnum(ShippingMethod)
  shippingMethod?: ShippingMethod;

  @IsOptional()
  @IsBoolean()
  isShippable?: boolean;

  @IsOptional()
  @IsBoolean()
  pickupOnly?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isFragile?: boolean;

  @IsOptional()
  @IsBoolean()
  isPerishable?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  availableFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  availableUntil?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  harvestDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
