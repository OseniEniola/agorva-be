// dto/add-pickup-location.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsArray, Min, Max } from 'class-validator';

export class AddPickupLocationDto {
  @ApiProperty({ example: 'Main Farm Entrance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1234 Farm Road, Surrey, BC' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 49.2827 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -123.1207 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ example: ['Monday', 'Wednesday', 'Friday'] })
  @IsArray()
  @IsNotEmpty()
  availableDays: string[];

  @ApiProperty({ example: '9:00 AM - 5:00 PM' })
  @IsString()
  @IsNotEmpty()
  hours: string;
}