import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { BusinessStatus } from 'src/common/enums/business-enum';
import { DeliveryDay } from 'src/common/enums/delivery-days-enum';

export class CreateRetailerDto {
  @IsString()
  businessName: string;

  @IsString()
  @IsOptional()
  businessSlug?: string;

  @IsString()
  businessAddress: string;

  @IsString()
  pickupLocation: string;

  @IsArray()
  @IsEnum(DeliveryDay, { each: true })
  businessDeliveryDays: DeliveryDay[];

  @IsOptional()
  @IsEnum(BusinessStatus)
  businessStatus?: BusinessStatus;
}
