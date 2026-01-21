// dto/add-certification.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsDateString 
} from 'class-validator';
import { CertificationType } from 'src/common/enums/products-enum';

export class AddCertificationDto {
  @ApiProperty({ 
    enum: CertificationType,
    example: CertificationType.CERTIFIED_ORGANIC 
  })
  @IsEnum(CertificationType)
  @IsNotEmpty()
  certificationType: CertificationType;

  @ApiProperty({ example: 'USDA Organic Certificate 2024' })
  @IsString()
  @IsNotEmpty()
  documentName: string;

  @ApiProperty({ example: 'https://storage.agorva.com/certs/organic-2024.pdf' })
  @IsString()
  @IsNotEmpty()
  documentUrl: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}