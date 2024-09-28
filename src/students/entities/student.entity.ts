import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { SkillCollection } from './skil-collection.entity';
import { CourseDetail } from 'src/courses/entities/courseStudentDetail.entity';

@Entity()
export class Student {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  nameInEnglish: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string | null; // e.g., null if no status

  @OneToMany(() => CourseDetail, (courseDetail) => courseDetail.student, {
    cascade: false,
  })
  courseDetails: CourseDetail[];

  @OneToMany(
    () => SkillCollection,
    (skillCollection) => skillCollection.student,
    {
      cascade: false,
    },
  )
  skillCollection: SkillCollection[];
}
