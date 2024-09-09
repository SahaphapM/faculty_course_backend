import { Skill } from 'src/skills/entities/skill.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import {
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { CourseDetails } from './courseDetails.entity';

@Entity()
export class Course {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Subject, (subject) => subject.courses, {
    cascade: false,
  })
  subject: Subject;

  @ManyToMany(() => Skill, (skill) => skill.subjects, { cascade: false })
  @JoinTable()
  skills: Skill[];

  @OneToMany(() => CourseDetails, (courseDetail) => courseDetail.course)
  courseDetails : CourseDetails[]
}
