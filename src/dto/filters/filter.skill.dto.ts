import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SkillFilterDto extends BaseFilterParams {
  //search
  @ApiPropertyOptional({ description: 'Filter by name or code', required: false, example: 'Programming' })
  @IsOptional()
  @IsString()
  nameCode?: string;

  @ApiPropertyOptional({ description: 'Learning domain', required: false, example: 'Cognitive' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ description: 'Filter by curriculum id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  curriculumId?: number;

  @ApiPropertyOptional({ description: 'Filter by branch id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @ApiPropertyOptional({ description: 'Filter by faculty id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @ApiPropertyOptional({ description: 'Filter by subject id', required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subjectId?: number;
}
