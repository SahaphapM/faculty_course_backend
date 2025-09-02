import { IsIn, IsOptional, IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// src/modules/curriculums/dto/skill-collection-summary.filter.dto.ts
export class SkillCollectionSummaryFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({
    description: 'Type: soft or hard',
    required: true,
    example: 'soft',
  })
  @IsNotEmpty()
  @IsIn(['soft', 'hard'])
  type?: 'soft' | 'hard';

  @ApiPropertyOptional({
    description: 'Student name (contains)',
    required: false,
    example: 'Somchai',
  })
  @IsOptional()
  @IsString()
  studentName?: string;

  @ApiPropertyOptional({
    description: 'Student code (contains)',
    required: false,
    example: '6412345',
  })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiPropertyOptional({
    description: 'Subject name (contains)',
    required: false,
    example: 'Database',
  })
  @IsOptional()
  @IsString()
  subjectName?: string;
}

export class SkillCollectionByCourseFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({
    description: 'Student name (contains)',
    required: false,
    example: 'Somchai',
  })
  @IsOptional()
  @IsString()
  studentName?: string;

  @ApiPropertyOptional({
    description: 'Student code (contains)',
    required: false,
    example: '6412345',
  })
  @IsOptional()
  @IsString()
  studentCode?: string;
}

export class SkillCollectionFilterDto extends BaseFilterParams {
  @ApiPropertyOptional({
    description: 'Course Id',
    required: true,
    example: '123',
  })
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  courseId: number;

  @ApiPropertyOptional({
    description: 'CLO Id',
    required: true,
    example: '123',
  })
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : value))
  cloId: number;
}