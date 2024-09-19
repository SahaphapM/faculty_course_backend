import { Subject } from 'src/subjects/entities/subject.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
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

  @OneToMany(() => CourseDetail, (courseDetail) => courseDetail.course)
  courseDetails: CourseDetail[];
}
