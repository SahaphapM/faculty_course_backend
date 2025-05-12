import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Transform, Type } from 'class-transformer';

export class StudentFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  nameCode?: string;

  @IsOptional()
  @IsString()
  skillName?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(String); // [ '67', '68' ]
    if (typeof value === 'string') return [value]; // '67' → [ '67' ]
    return [];
  })
  @IsArray()
  @IsString({ each: true })
  codeYears?: string[];

  @IsOptional()
  @Type(() => Number)
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
