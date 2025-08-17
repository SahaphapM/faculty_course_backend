import { IsIn, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

// src/modules/curriculums/dto/skill-collection-summary.filter.dto.ts
export class SkillCollectionSummaryFilterDto extends BaseFilterParams {
 
  @IsNotEmpty()
  @IsIn(['soft', 'hard'])
  type?: 'soft' | 'hard';
  
  @IsOptional()
  @IsString()
  studentName?: string;

  @IsOptional()
  @IsString()
  studentCode?: string;

  @IsOptional()
  @IsString()
  subjectName?: string;
}
export class SkillCollectionByCourseFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  studentName?: string;

  @IsOptional()
  @IsString()
  studentCode?: string;
}