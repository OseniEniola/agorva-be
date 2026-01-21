// dto/farmer-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsArray,
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';
import { FarmerStatus, FarmingMethod } from 'src/common/enums/business-enum';
import { CertificationType } from 'src/common/enums/products-enum';
import { DeliveryDay } from 'src/common/enums/delivery-days-enum';

export class FarmerQueryDto {
  @ApiProperty({ required: false, example: 'organic vegetables' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 'Surrey' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false, example: 'British Columbia' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ required: false, enum: FarmerStatus })
  @IsOptional()
  @IsEnum(FarmerStatus)
  status?: FarmerStatus;

  @ApiProperty({ 
    required: false, 
    enum: FarmingMethod,
    isArray: true,
    example: [FarmingMethod.ORGANIC] 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(FarmingMethod, { each: true })
  farmingMethods?: FarmingMethod[];

  @ApiProperty({ 
    required: false, 
    enum: CertificationType,
    isArray: true,
    example: [CertificationType.CERTIFIED_ORGANIC] 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CertificationType, { each: true })
  certifications?: CertificationType[];

  @ApiProperty({ 
    required: false, 
    enum: DeliveryDay,
    isArray: true,
    example: [DeliveryDay.MONDAY] 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DeliveryDay, { each: true })
  deliveryDays?: DeliveryDay[];

  @ApiProperty({ required: false, example: 49.2827 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false, example: -123.1207 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiProperty({ required: false, example: 50, description: 'Radius in kilometers' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  radiusKm?: number;

  @ApiProperty({ required: false, example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}