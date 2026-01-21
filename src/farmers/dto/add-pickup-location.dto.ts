import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsArray, 
  IsEnum,
  Min, 
  Max,
  ArrayMinSize 
} from 'class-validator';
import { DeliveryDay } from 'src/common/enums/delivery-days-enum';

export class AddPickupLocationDto {
  @ApiProperty({ example: 'Main Farm Entrance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1234 Farm Road, Surrey, BC V3M 5G7' })
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

  @ApiProperty({ 
    enum: DeliveryDay,
    isArray: true,
    example: [DeliveryDay.MONDAY, DeliveryDay.WEDNESDAY, DeliveryDay.FRIDAY] 
  })
  @IsArray()
  @IsEnum(DeliveryDay, { each: true })
  @ArrayMinSize(1)
  availableDays: DeliveryDay[];

  @ApiProperty({ example: '9:00 AM - 5:00 PM' })
  @IsString()
  @IsNotEmpty()
  hours: string;
}