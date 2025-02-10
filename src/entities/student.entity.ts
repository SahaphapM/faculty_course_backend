import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  SkillCollection,
  SkillCollectionTree,
} from './skill-collection.entity';
import { CourseEnrollment } from './course-enrollment';
import { Branch } from './branch.entity';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;
  // define id by user

  @Column()
  code: string;

  @Column()
  thaiName: string;

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
