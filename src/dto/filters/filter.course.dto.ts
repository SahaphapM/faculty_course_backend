import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
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
  @IsArray()
  codeYears?: number[];

  @IsOptional()
  @IsString()
  semesters?: number[];

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
