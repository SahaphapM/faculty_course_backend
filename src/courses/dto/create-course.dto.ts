import { Skill } from 'src/skills/entities/skill.entity';
import { CourseDetail } from '../entities/courseStudentDetail.entity';
import { Subject } from 'src/subjects/entities/subject.entity';

export class CreateCourseDto {
  id: string;

  name: string;

  description: string;

  active: boolean;

  subject: Subject;

  skills: Skill[];

  courseDetails: CourseDetail[];
}
