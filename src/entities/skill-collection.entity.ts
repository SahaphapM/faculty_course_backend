import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { CourseEnrollment } from './course-enrollment';
import { SkillLevel } from 'src/enums/skill-level.enum';
import { Skill } from './skill.entity';

@Entity()
export class SkillCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  level: SkillLevel;

  @Column({ default: 0 })
  score: number;

  @Column({ default: false })
  passed: boolean;

  @ManyToOne(() => Student, (student) => student.skillCollection, {
    cascade: false,
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  // @ManyToOne(() => SkillDetail, (sd) => sd.skillCollection, {
  //   cascade: false,
  // })
  // skillDetail: SkillDetail;

  @ManyToOne(() => Skill, (s) => s.skillCollections, {
    cascade: false,
  })
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @ManyToOne(
    () => CourseEnrollment,
    (courseStudentDetail) => courseStudentDetail.skillCollections,
    // {
    //   cascade: true,
    //   onDelete: 'CASCADE',
    // },
  )
  @JoinColumn({ name: 'courseEnrollmentId' })
  courseEnrollment: CourseEnrollment;

  // // before insert skillCollection, also set name and requiredLevel from skillDetail
  // @BeforeInsert()
  // async setAttribute() {
  //   this.name = this.skillDetail.skill.name;
  //   this.requiredLevel = this.skillDetail.requiredLevel;
  // }
}

export class SkillCollectionTree {
  id: number;

  name: string;

  acquiredLevel: number;

  requiredLevel: number;

  pass: boolean;

  children: SkillCollectionTree[];
}
