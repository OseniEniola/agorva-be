import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  ValidateNested,
  IsEmail,
  IsPhoneNumber,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryProvider } from '../entities/delivery.entity';

export class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class ContactDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyName?: string;
}

export class DeliveryItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class CreateDeliveryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @ApiProperty({ enum: DeliveryProvider, default: DeliveryProvider.UBER_DIRECT })
  @IsEnum(DeliveryProvider)
  provider: DeliveryProvider;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  pickupAddress: AddressDto;

  @ApiProperty({ type: ContactDto })
  @ValidateNested()
  @Type(() => ContactDto)
  pickupContact: ContactDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pickupNotes?: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  dropoffAddress: AddressDto;

  @ApiProperty({ type: ContactDto })
  @ValidateNested()
  @Type(() => ContactDto)
  dropoffContact: ContactDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dropoffNotes?: string;

  @ApiProperty({ type: [DeliveryItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryItemDto)
  items: DeliveryItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  signatureRequired?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  proofOfDeliveryRequired?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledPickupTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledDropoffTime?: string;
}
