import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';
import { Transform, Type } from 'class-transformer';

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
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number); // [ '2568', '2569' ]
    if (typeof value === 'string') return [Number(value)]; // '2568' → [2568]
    return [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  years?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    if (typeof value === 'string') return [Number(value)];
    return [];
  })
  @IsArray()
  @IsNumber({}, { each: true })
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
