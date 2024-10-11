import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  description: string;

  @IsOptional()
  active: boolean;

  @IsNotEmpty()
  subjectId: string;

  @IsNotEmpty()
  curriculumId: string;

  @IsNotEmpty()
  teacherListId: number[];
}
