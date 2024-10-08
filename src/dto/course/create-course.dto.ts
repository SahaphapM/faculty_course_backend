import { CourseStudentDetail } from 'src/entities/courseStudentDetail.entity';
import { Skill } from 'src/entities/skill.entity';
import { Subject } from 'src/entities/subject.entity';

export class CreateCourseDto {
  id: string;

  name: string;

  description: string;

  active: boolean;

  subject: Subject;

  skills: Skill[];

  courseStudentDetails: CourseStudentDetail[];
}
