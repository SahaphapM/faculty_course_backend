import { SubjectType } from 'src/enums/subject-types.enum';

export class CreateCourseSpecDto {
  thaiName: string;

  engName: string;

  engDescription: string;

  thaiDescription: string;

  credit: string;

  type: SubjectType;

  subjectCode: string;

  curriculumId: number;
}
