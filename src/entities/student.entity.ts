import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import {
  SkillCollection,
  SkillCollectionTree,
} from './skill-collection.entity';
import { CourseEnrollment } from './course-enrollment';
import { Branch } from './branch.entity';

@Entity()
export class Student {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  engName: string;

  @OneToOne(() => Branch)
  @JoinColumn()
  branch: Branch;

  @Column({ nullable: true })
  enrollmentDate: Date;

  @Column({ nullable: true })
  socials: string;

  @OneToMany(() => CourseEnrollment, (s) => s.student, {
    cascade: false,
  })
  courseEnrollment: CourseEnrollment[];

  @OneToMany(() => SkillCollection, (s) => s.student, {
    cascade: false,
  })
  skillCollection: SkillCollection[];

  // It is Not Column but is needed to show skill collection in tree view form.
  skillCollectionTree: SkillCollectionTree[];
}
