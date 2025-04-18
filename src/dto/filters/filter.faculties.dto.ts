import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class FacultyFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  thaiName?: string;

  @IsOptional()
  @IsString()
  engName?: string;
}
