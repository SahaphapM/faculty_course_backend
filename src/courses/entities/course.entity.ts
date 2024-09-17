import { Skill } from 'src/skills/entities/skill.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { CourseDetail } from './courseDetail.entity';

@Entity()
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => Subject, (subject) => subject.courses, {
    cascade: false,
  })
  subject: Subject;

  @ManyToMany(() => Skill, (skill) => skill.subjects, { cascade: false })
  @JoinTable()
  skills: Skill[];

  @OneToMany(() => CourseDetail, (courseDetail) => courseDetail.course)
  courseDetails: CourseDetail[];
}
