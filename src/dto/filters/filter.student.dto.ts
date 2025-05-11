import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Type } from 'class-transformer';

export class StudentFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  nameCode?: string;

  @IsOptional()
  @IsString()
  skillName?: string;

  @IsOptional()
  @IsArray()
  codeYears?: string[];

  @IsOptional()
  @IsString()
  curriculumCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;
}
