import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CourseFilterDto extends BaseFilterParams {
  //search
  @ApiPropertyOptional({
    description: 'Filter by name or code',
    required: false,
    example: 'Intro to Programming',
  })
  @IsOptional()
  @IsString()
  nameCode?: string;

  @ApiPropertyOptional({
    description: 'Active courses only',
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
  active?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by years (array)',
    required: false,
    example: [2568, 2569],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number); // [ '2568', '2569' ]
    if (typeof value === 'string') return [Number(value)]; // '2568' → [2568]
    return [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  years?: number[];

  @ApiPropertyOptional({
    description: 'Filter by semesters (array)',
    required: false,
    example: [1, 2],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') return [Number(value)];
    return [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  semesters?: number[];

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
    description: 'Filter by instructor id',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  instructorId?: number;
}
