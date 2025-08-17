import { IsNumber, IsOptional } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class CloFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsNumber()
  subjectId?: number;
}
