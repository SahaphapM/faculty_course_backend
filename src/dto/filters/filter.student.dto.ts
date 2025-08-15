import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StudentFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({
    description: 'Filter by name/code (contains)',
    required: false,
    example: 'John',
  })
  @IsOptional()
  @IsString()
  nameCode?: string;

  @ApiPropertyOptional({
    description: 'Filter by related skill name (contains)',
    required: false,
    example: 'Programming',
  })
  @IsOptional()
  @IsString()
  skillName?: string;

  @ApiPropertyOptional({
    description: 'Filter by code years (array of strings)',
    required: false,
    type: [String],
    example: ['67', '68'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(String); // [ '67', '68' ]
    if (typeof value === 'string') return [value]; // '67' → [ '67' ]
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  codeYears?: string[];

  @ApiPropertyOptional({
    description: 'Filter by curriculum id',
    required: false,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  curriculumId?: number;

  @ApiPropertyOptional({
    description: 'Filter by faculty id',
    required: false,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @ApiPropertyOptional({
    description: 'Filter by branch id',
    required: false,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;
}
