import { IsString, IsArray, IsEnum, IsOptional } from 'class-validator';
import { BusinessStatus } from 'src/common/enums/business-enum';
import { DeliveryDay } from 'src/common/enums/delivery-days-enum';

export class UpdateRetailerDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(DeliveryDay, { each: true })
  businessDeliveryDays?: DeliveryDay[];

  @IsOptional()
  @IsEnum(BusinessStatus)
  businessStatus?: BusinessStatus;
}
