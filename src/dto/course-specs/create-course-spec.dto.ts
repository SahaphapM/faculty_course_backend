import { IsNumber, IsObject, IsString } from 'class-validator';
import { Subject } from 'src/entities/subject.entity';
import { SubjectType } from 'src/enums/subject-types.enum';

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

  @IsString()
  type: SubjectType;

  // get code subject from here
  @IsObject()
  subject: Partial<Subject>;

  @IsNumber()
  curriculumId: number;
}
