import { Subject } from 'src/entities/subject.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { CourseEnrollment } from './course-enrollment';
import { Teacher } from './teacher.entity';

@Entity()
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: true, nullable: true })
  active: boolean;

  @ManyToOne(() => Subject, (subject) => subject.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  // @ManyToOne(() => Subject, (subject) => subject.courses, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'curriculumId' })
  // curriculum: Curriculum;

  @OneToMany(() => CourseEnrollment, (c) => c.course, { cascade: true })
  courseEnrollment: CourseEnrollment[];

  @ManyToMany(() => Teacher, (c) => c.courses)
  @JoinTable()
  teachers: Teacher[];
}
