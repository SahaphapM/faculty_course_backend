import { Student } from 'src/students/entities/student.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { SkillCollection } from 'src/students/entities/skil-collection.entity';

@Entity()
export class CourseStudentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'float', nullable: true })
  assignmentScore: number;

  @Column({ type: 'float', nullable: true })
  testScore: number;

  @Column({ type: 'float', nullable: true })
  projectScore: number;

  @ManyToOne(() => Course, (course) => course.courseStudentDetails, {
    onDelete: 'CASCADE', // When course is deleted. This record will be deleted
  })
  course: Course;

  @ManyToOne(() => Student, (student) => student.courseStudentDetails, {
    cascade: false,
  })
  student: Student;

  @OneToMany(
    () => SkillCollection,
    (skillCollection) => skillCollection.courseStudentDetail,
  )
  skillCollections: SkillCollection[];
}
