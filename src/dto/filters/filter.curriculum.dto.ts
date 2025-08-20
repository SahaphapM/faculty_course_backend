import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CurriculumFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({
    description: 'Filter by name or code',
    required: false,
    example: 'Computer Science',
  })
  @IsOptional()
  @IsString()
  nameCode?: string;

  @ApiPropertyOptional({
    description: 'Degree filter (e.g., BSc, MSc)',
    required: false,
    example: 'BSc',
  })
  @IsOptional()
  @IsString()
  degree?: string;

  @ApiPropertyOptional({
    description: 'Filter by branch id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @ApiPropertyOptional({
    description: 'Filter by faculty id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @ApiPropertyOptional({
    description: 'Filter by coordinator id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  coordinatorId?: number;
}
