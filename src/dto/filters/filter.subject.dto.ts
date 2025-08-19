import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubjectFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by name/code', required: false, example: 'Database' })
  @IsOptional()
  @IsString()
  nameCode?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Subject type', required: false, example: 'Lecture' })
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number) // 👈 สำคัญ!
  @IsNumber()
  @ApiPropertyOptional({ description: 'Filter by curriculum id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  curriculumId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({ description: 'Filter by faculty id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({ description: 'Filter by branch id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;
}
