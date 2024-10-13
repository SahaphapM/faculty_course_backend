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
import { Curriculum } from './curriculum.entity';
import { Teacher } from './teacher.entity';

@Entity()
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Subject, (subject) => subject.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @ManyToOne(() => Subject, (subject) => subject.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;

  @OneToMany(() => CourseEnrollment, (c) => c.course)
  courseEnrollment: CourseEnrollment[];

  @ManyToMany(() => Course, (c) => c.teachers)
  @JoinTable()
  teachers: Teacher[];
}
