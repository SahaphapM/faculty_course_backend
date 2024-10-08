import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { CourseStudentDetail } from './courseStudentDetail.entity';
import { SkillDetail } from './skillDetail.entity';

@Entity()
export class SkillCollection {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ nullable: true })
  // name: string;

  @Column({ default: 0 })
  acquiredLevel: number;

  // @Column({ nullable: true })
  // requiredLevel: number;

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
    // {
    //   cascade: true,
    //   onDelete: 'CASCADE',
    // },
  )
  courseStudentDetail: CourseStudentDetail;

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
