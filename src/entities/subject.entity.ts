import { Course } from 'src/entities/course.entity';
import { Curriculum } from 'src/entities/curriculum.entity';
import { SkillExpectedLevel } from 'src/entities/skill-exp-lvl';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SubjectType } from 'src/enums/subject-types.enum';
import { CourseSpec } from './course-spec.entity';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;
  // define id by user
  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  thaiName: string;

  @Column({ nullable: true })
  engName: string;

  @Column({ nullable: true })
  thaiDescription: string;

  @Column({ nullable: true })
  engDescription: string;

  @Column({ nullable: true })
  credit: string; //3 (2-2-5)

  @Column({
    // enum: SubjectType, // DB not support
    default: SubjectType.Compulsory,
    nullable: true,
  })
  type: SubjectType;

  @OneToMany(() => CourseSpec, (courseSpec) => courseSpec.subject, {
    cascade: ['insert', 'update'],
  })
  courseSpecs: CourseSpec[];

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.subjects)
  curriculum: Curriculum;

  //////////////// อาจจะไม่ได้ใช้แล้ว เพราะต้องโยกไปที่ CourseSpec แทน //////////////

  @OneToMany(
    () => SkillExpectedLevel,
    (skillExpectedLevel) => skillExpectedLevel.subject,
    {
      cascade: true,
      nullable: true,
    },
  )
  skillExpectedLevels: SkillExpectedLevel[];

  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];
}
