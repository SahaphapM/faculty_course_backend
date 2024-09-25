import { Student } from 'src/students/entities/student.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { SkillCollection } from 'src/students/entities/skil-collection';

@Entity()
export class CourseDetail {
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

  @ManyToOne(() => Course, (course) => course.courseDetails, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  course: Course;

  @ManyToOne(() => Student, (student) => student.courseDetails, {
    cascade: false,
  })
  student: Student;

  @OneToMany(
    () => SkillCollection,
    (skillCollection) => skillCollection.courseDetail,
  )
  skillCollections: SkillCollection[];
}
