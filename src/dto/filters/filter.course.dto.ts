import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Type } from 'class-transformer';

export class CourseFilterDto extends BaseFilterParams {
  //search
  @IsOptional()
  @IsString()
  nameCode?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subjectId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  curriculumId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;
}
