import { IsNumber, IsObject } from 'class-validator';
import { Subject } from 'src/entities/subject.entity';

export class CreateCourseSpecDto {
  // @IsString()
  // thaiName: string;

  // @IsString()
  // engName: string;

  // @IsString()
  // engDescription: string;

  // @IsString()
  // thaiDescription: string;

  // @IsString()
  // credit: string;

  // @IsString()
  // type: SubjectType;

  // get code subject from here
  @IsObject()
  subject: Subject;

  @IsNumber()
  curriculumId: number;
}
