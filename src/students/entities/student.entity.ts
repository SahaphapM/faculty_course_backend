import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { SkillCollection, SkillCollectionTree } from './skil-collection.entity';
import { CourseStudentDetail } from 'src/courses/entities/courseStudentDetail.entity';

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

  @OneToMany(
    () => CourseStudentDetail,
    (courseStudentDetail) => courseStudentDetail.student,
    {
      cascade: false,
    },
  )
  courseStudentDetails: CourseStudentDetail[];

  @OneToMany(
    () => SkillCollection,
    (skillCollection) => skillCollection.student,
    {
      cascade: false,
    },
  )
  skillCollection: SkillCollection[];

  // It is Not Column but is needed to show skill collection in tree view form.
  skillCollectionTree: SkillCollectionTree[];
}
