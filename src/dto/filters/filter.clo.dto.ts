import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class CloFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  subjectId?: number;
}
