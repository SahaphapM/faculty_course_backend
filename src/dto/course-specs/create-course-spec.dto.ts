import { SubjectType } from 'src/enums/subject-types.enum';

export class CreateCourseSpecDto {
  name: string;

  engName: string;

  description: string;

  credit: string;

  type: SubjectType;

  subjectCode: string;

  curriculumId: number;
}
