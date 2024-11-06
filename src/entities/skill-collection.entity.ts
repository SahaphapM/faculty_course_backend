import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { CourseEnrollment } from './course-enrollment';
import { SkillExpectedLevel } from './skill-exp-lvl';

@Entity()
export class SkillCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  gainedLevel: number;

  // @Column({ default: 0 })
  // score: number;

  @Column({ default: false })
  passed: boolean;

  @ManyToOne(() => Student, (student) => student.skillCollection, {
    cascade: false,
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => SkillExpectedLevel, (sd) => sd.skillCollection, {
    cascade: false,
  })
  @JoinColumn({ name: 'ExpectedLevelId' })
  skillExpectedLevels: SkillExpectedLevel;

  @ManyToOne(
    () => CourseEnrollment,
    (courseStudentDetail) => courseStudentDetail.skillCollections,
  )
  @JoinColumn({ name: 'courseEnrollmentId' })
  courseEnrollment: CourseEnrollment;

  // // before insert skillCollection, also set name and requiredLevel from expectedLevel
  // @BeforeInsert()
  // async setAttribute() {
  //   this.name = this.expectedLevel.skill.name;
  //   this.requiredLevel = this.expectedLevel.requiredLevel;
  // }
}

export class SkillCollectionTree {
  id: number;

  name: string;

  gainedLevel: number;

  expectedLevel: number;

  passed: boolean;

  children: SkillCollectionTree[];
}
