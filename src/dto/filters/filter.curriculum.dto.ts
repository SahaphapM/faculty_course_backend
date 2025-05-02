import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Type } from 'class-transformer';

export class CurriculumFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  nameCode?: string;

  @IsOptional()
  @IsString()
  degree?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;
}
