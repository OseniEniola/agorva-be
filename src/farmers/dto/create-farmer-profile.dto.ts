// dto/create-farmer-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { FarmingMethod } from 'src/common/enums/business-enum';
import { DeliveryDay } from 'src/common/enums/delivery-days-enum';
import { CertificationType } from 'src/common/enums/products-enum';

export class CreateFarmerProfileDto {
  @ApiProperty({ example: 'Green Valley Farm' })
  @IsString()
  @IsNotEmpty()
  farmName: string;

  @ApiProperty({ 
    example: 'Family-owned organic farm specializing in seasonal vegetables and fruits',
    required: false 
  })
  @IsString()
  @IsOptional()
  description?: string;

  // Location
  @ApiProperty({ example: 49.2827, required: false })
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ example: -123.1207, required: false })
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ example: '1234 Farm Road', required: false })
  @IsString()
  @IsOptional()
  farmAddress?: string;

  @ApiProperty({ example: 'Surrey', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'British Columbia', required: false })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiProperty({ example: 'V3M 5G7', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  // Farm details
  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  farmSizeAcres?: number;

  @ApiProperty({ 
    enum: FarmingMethod,
    isArray: true,
    example: [FarmingMethod.ORGANIC, FarmingMethod.REGENERATIVE],
    required: false 
  })
  @IsArray()
  @IsEnum(FarmingMethod, { each: true })
  @IsOptional()
  farmingMethods?: FarmingMethod[];

  @ApiProperty({ 
    enum: CertificationType,
    isArray: true,
    example: [CertificationType.CERTIFIED_ORGANIC, CertificationType.NON_GMO_VERIFIED],
    required: false 
  })
  @IsArray()
  @IsEnum(CertificationType, { each: true })
  @IsOptional()
  certifications?: CertificationType[];

  // Business details
  @ApiProperty({ example: 'BN123456789', required: false })
  @IsString()
  @IsOptional()
  businessRegistrationNumber?: string;

  @ApiProperty({ example: 'TAX123456', required: false })
  @IsString()
  @IsOptional()
  taxId?: string;

  // Delivery settings
  @ApiProperty({ example: 25, required: false, description: 'Delivery radius in kilometers' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(500)
  deliveryRadiusKm?: number;

  @ApiProperty({ example: 50, required: false, description: 'Minimum order amount in CAD' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiProperty({ 
    enum: DeliveryDay,
    isArray: true,
    example: [DeliveryDay.MONDAY, DeliveryDay.WEDNESDAY, DeliveryDay.FRIDAY],
    required: false 
  })
  @IsArray()
  @IsEnum(DeliveryDay, { each: true })
  @IsOptional()
  deliveryDays?: DeliveryDay[];
}