import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class CoordinatorFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  nameCodeMail?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  curriculumId?: string;
}
