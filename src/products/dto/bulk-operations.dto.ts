// src/products/dto/bulk-operations.dto.ts
import { IsArray, IsNotEmpty, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory, ProductStatus, UnitType, CertificationType, ProductCondition, StorageType, ShippingMethod, ProductOrigin } from 'src/common/enums/products-enum';

export class BulkProductDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ enum: ProductCategory })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  compareAtPrice?: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ enum: UnitType })
  @IsEnum(UnitType)
  unit: UnitType;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  minOrderQuantity: number;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  maxOrderQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  sku?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  barcode?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ enum: CertificationType, isArray: true, required: false })
  @IsOptional()
  @IsEnum(CertificationType, { each: true })
  certifications?: CertificationType[];

  @ApiProperty({ enum: ProductCondition })
  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @ApiProperty({ required: false })
  @IsOptional()
  conditionNotes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  businessName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  originLocation?: string;

  @ApiProperty({ enum: ProductOrigin })
  @IsEnum(ProductOrigin)
  origin: ProductOrigin;

  @ApiProperty({ required: false })
  @IsOptional()
  harvestDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  expiryDate?: string;

  @ApiProperty({ enum: StorageType })
  @IsEnum(StorageType)
  storageType: StorageType;

  @ApiProperty({ type: Boolean })
  requiresRefrigeration: boolean;

  @ApiProperty({ enum: ShippingMethod })
  @IsEnum(ShippingMethod)
  shippingMethod: ShippingMethod;

  @ApiProperty({ type: Boolean })
  isShippable: boolean;

  @ApiProperty({ type: Boolean })
  pickupOnly: boolean;

  @ApiProperty({ type: Number, required: false })
  @IsOptional()
  weight?: number;

  @ApiProperty({ type: Boolean })
  isFragile: boolean;

  @ApiProperty({ type: Boolean })
  isPerishable: boolean;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  imageUrls?: string[];
}

export class BulkCreateProductsDto {
  @ApiProperty({ type: [BulkProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkProductDto)
  products: BulkProductDto[];
}

export class BulkDeleteProductsDto {
  @ApiProperty({ type: [String], description: 'Array of product IDs to delete' })
  @IsArray()
  @IsNotEmpty({ each: true })
  productIds: string[];
}

export class BulkOperationResultDto {
  @ApiProperty()
  totalProcessed: number;

  @ApiProperty()
  successful: number;

  @ApiProperty()
  failed: number;

  @ApiProperty({ type: [Object] })
  errors: Array<{
    row?: number;
    productId?: string;
    error: string;
  }>;

  @ApiProperty({ type: [String] })
  createdIds?: string[];

  @ApiProperty({ type: [String] })
  deletedIds?: string[];
}