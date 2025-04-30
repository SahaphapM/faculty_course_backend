import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class SkillFilterDto extends BaseFilterParams {
  //search
  @IsOptional()
  @IsString()
  thaiName?: string;

  @IsOptional()
  @IsString()
  curriculumCode?: string;
}
