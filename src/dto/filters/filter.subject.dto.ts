import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Type } from 'class-transformer';

export class SubjectFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  nameCode?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number) // 👈 สำคัญ!
  @IsNumber()
  curriculumId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;
}
