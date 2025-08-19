import { IsOptional, IsNumber } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class InternshipsFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsNumber()
  curriculumId?: number;
}
