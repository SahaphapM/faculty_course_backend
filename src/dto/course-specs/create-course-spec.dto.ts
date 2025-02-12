import { IsEnum, IsNumber, IsString } from 'class-validator';
import { SubjectType } from 'src/enums/subject-types.enum';
import { CreateSubjectDto } from '../subject/create-subject.dto';
import { Type } from 'class-transformer';

export class CreateCourseSpecDto {
  @IsString()
  thaiName: string;

  @IsString()
  engName: string;

  @IsString()
  engDescription: string;

  @IsString()
  thaiDescription: string;

  @IsString()
  credit: string;

  @IsEnum(SubjectType)
  type: SubjectType;

  // get code subject from here
  @Type(() => CreateSubjectDto)
  subject: CreateSubjectDto;

  @IsNumber({ allowNaN: false, allowInfinity: false })
  curriculumId: number;
}
