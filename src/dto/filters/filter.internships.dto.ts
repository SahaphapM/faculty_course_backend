import { IsOptional, IsNumber, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InternshipsFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({
    description: 'Filter by title',
    required: false,
  })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Filter by curriculumId',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  curriculumId?: number;

  @ApiPropertyOptional({
    description: 'Filter by internship year (e.g. 2024 or BE years as used in UI)',
    required: false,
    example: '2024',
  })
  @IsOptional()
  @IsString()
  year?: string;
}
