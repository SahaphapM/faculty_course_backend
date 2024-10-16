import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({ allowNaN: false }, { each: true })
  teacherListId: number[];
}
