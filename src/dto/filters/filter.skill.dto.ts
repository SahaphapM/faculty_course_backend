import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SkillFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({
    description: 'Learning domain',
    required: false,
    example: 'Cognitive',
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({
    description: 'Filter by curriculum id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  curriculumId?: number;

  @ApiPropertyOptional({
    description: 'Filter by branch id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  branchId?: number;

  @ApiPropertyOptional({
    description: 'Filter by faculty id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  facultyId?: number;

  @ApiPropertyOptional({
    description: 'Filter by subject id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  subjectId?: number;

  @ApiPropertyOptional({
    description: 'Whether to include sub-skills only',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    // already boolean?
    if (typeof value === 'boolean') return value;

    // string cases
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true' || v === '1') return true;
      if (v === 'false' || v === '0') return false;
    }

    // anything else -> undefined (means "not provided")
    return undefined;
  })
  subOnly?: boolean;
}
