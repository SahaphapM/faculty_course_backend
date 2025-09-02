import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Transform, Type } from 'class-transformer';
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
  @IsNumber()
  branchId?: number;

  @ApiPropertyOptional({
    description: 'Filter by faculty id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  facultyId?: number;

  @ApiPropertyOptional({
    description: 'Filter by coordinator id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  coordinatorId?: number;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    required: false,
    example: true,
    type: Boolean,
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
  active?: boolean;
}
