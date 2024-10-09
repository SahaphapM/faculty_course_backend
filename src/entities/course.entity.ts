import { Subject } from 'src/entities/subject.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { CourseStudentDetail } from './courseStudentDetail.entity';

@Entity()
export class Course {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  active: boolean;

  @ManyToOne(() => Subject, (subject) => subject.courses, {
    cascade: false,
  })
  subject: Subject;

  @OneToMany(
    () => CourseStudentDetail,
    (courseStudentDetail) => courseStudentDetail.course,
  )
  courseStudentDetails: CourseStudentDetail[];
}
