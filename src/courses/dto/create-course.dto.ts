import { Skill } from 'src/skills/entities/skill.entity';
import { CourseDetail } from '../entities/courseDetail.entity';
import { Subject } from 'src/subjects/entities/subject.entity';

export class CreateCourseDto {
  id: string;

  name: string;

  description: string;

  subject: Subject;

  skills: Skill[];

  courseDetails: CourseDetail[];
}
