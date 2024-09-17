import { Student } from 'src/students/entities/student.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from './course.entity';

@Entity()
export class CourseDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.courseDetails, { cascade: false })
  course: Course;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'float', nullable: true })
  assignmentScore: number;

  @Column({ type: 'float', nullable: true })
  testScore: number;

  @Column({ type: 'float', nullable: true })
  projectScore: number;

  @ManyToOne(() => Student, (student) => student.courseDetails, {
    cascade: false,
  })
  student: Student;
}
