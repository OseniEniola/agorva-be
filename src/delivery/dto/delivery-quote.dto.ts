import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeliveryQuoteRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dropoffAddress: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pickupLatitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pickupLongitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  dropoffLatitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  dropoffLongitude?: number;
}

export class DeliveryQuoteResponseDto {
  @ApiProperty()
  quoteId: string;

  @ApiProperty()
  fee: number;

  @ApiProperty()
  currencyCode: string;

  @ApiProperty({ required: false })
  pickupEta?: string;

  @ApiProperty({ required: false })
  dropoffEta?: string;

  @ApiProperty({ required: false })
  duration?: number;

  @ApiProperty()
  expiresAt: string;
}
