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

  @Column({ default: false })
  passed: boolean;

  @ManyToOne(() => Student, (student) => student.skillCollection, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  // skill expected level + skill + subject
  @ManyToOne(() => SkillExpectedLevel, (sd) => sd.skillCollection, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ExpectedLevelId' })
  skillExpectedLevels: SkillExpectedLevel;

  @ManyToOne(
    () => CourseEnrollment,
    (courseStudentDetail) => courseStudentDetail.skillCollections,
    {
      onDelete: 'CASCADE',
    },
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

  skillId: number;

  name: string;

  gainedLevel: number;

  expectedLevel: number;

  passed: boolean;

  children: SkillCollectionTree[];
}
