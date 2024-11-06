import { Student } from 'src/entities/student.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { SkillCollection } from 'src/entities/skill-collection.entity';

@Entity()
export class CourseEnrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.courseEnrollment, {
    onDelete: 'CASCADE', // When course is deleted. This record will be deleted
  })
  course: Course;

  @ManyToOne(() => Student, (student) => student.courseEnrollment, {
    cascade: false,
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @OneToMany(
    () => SkillCollection,
    (skillCollection) => skillCollection.courseEnrollment,
    {
      cascade: true,
    }
  )
  skillCollections: SkillCollection[];
}
