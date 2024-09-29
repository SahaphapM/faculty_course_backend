import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { SkillDetail } from 'src/skills/entities/skillDetail.entity';
import { CourseStudentDetail } from 'src/courses/entities/courseStudentDetail.entity';

@Entity()
export class SkillCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  acquiredLevel: number;

  @Column({ default: false })
  pass: boolean;

  @ManyToOne(() => Student, (student) => student.skillCollection, {
    cascade: false,
  })
  student: Student;

  @ManyToOne(() => SkillDetail, (skillDetail) => skillDetail.skillCollection, {
    cascade: false,
  })
  skillDetail: SkillDetail;

  @ManyToOne(
    () => CourseStudentDetail,
    (courseStudentDetail) => courseStudentDetail.skillCollections,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  courseStudentDetail: CourseStudentDetail;
}
