import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SkillFilterDto extends BaseFilterParams {
  //search
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Skill name (contains)', required: false, example: 'Programming' })
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({ description: 'Filter by curriculum id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  curriculumId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subjectId?: number;
}
