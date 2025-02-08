import { Subject } from 'src/entities/subject.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseEnrollment } from './course-enrollment';
import { Instructor } from './instructor.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToMany(() => Instructor, (c) => c.courses)
  @JoinTable()
  instructors: Instructor[];
}
