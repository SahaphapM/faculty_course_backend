import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class PloFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  curriculumCode?: string;
}
