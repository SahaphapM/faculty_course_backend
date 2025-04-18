import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class SkillFilterDto extends BaseFilterParams {
  //search
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  curriculumCode?: string;
}
