import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsBoolean()
  active: boolean;

  @IsString()
  subjectId: string;

  // @IsString()
  // curriculumId: string;

  @IsArray()
  @IsNumber({ allowNaN: false }, { each: true })
  teacherListId: number[];
}
