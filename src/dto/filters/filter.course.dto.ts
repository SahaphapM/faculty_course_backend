import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class CourseFilterDto extends BaseFilterParams {
  //search
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  thaiName?: string;
}
