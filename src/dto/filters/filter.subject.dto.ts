import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class SubjectFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  thaiName?: string;

  @IsOptional()
  @IsString()
  engName?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  curriculumCode?: string;
}
