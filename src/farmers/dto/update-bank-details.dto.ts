// dto/update-bank-details.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateBankDetailsDto {
  @ApiProperty({ example: '123456789' })
  @IsString()
  @IsNotEmpty()
  bankAccountNumber: string;

  @ApiProperty({ example: '021000021' })
  @IsString()
  @IsNotEmpty()
  bankRoutingNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  bankAccountHolderName: string;
}