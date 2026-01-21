import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumberString } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  @IsNumberString()
  limit?: number;
}
