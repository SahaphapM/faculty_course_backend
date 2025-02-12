import { Curriculum } from 'src/entities/curriculum.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Column,
} from 'typeorm';
import { Subject } from './subject.entity';
import { Clo } from './clo.entity';
import { SubjectType } from 'src/enums/subject-types.enum';

@Entity()
export class CourseSpec {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  thaiName: string;

  @Column({ nullable: true })
  engName: string;

  @Column({ nullable: true, type: 'longtext' })
  thaiDescription: string;

  @Column({ nullable: true, type: 'longtext' })
  engDescription: string;

  @Column({ nullable: true })
  credit: string; //3 (2-2-5)

  @Column({
    // enum: SubjectType, // DB not support
    default: SubjectType.Compulsory,
  })
  type: SubjectType;

  // ความสัมพันธ์กับ Subject
  @ManyToOne(() => Subject, (subject) => subject.courseSpecs, {
    cascade: ['insert'],
  })
  @JoinColumn({ name: 'subjectId' }) //use subjectId PK
  subject: Subject;

  // ความสัมพันธ์กับ Clo
  @OneToMany(() => Clo, (clo) => clo.courseSpec, { nullable: true })
  clos: Clo[];

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.courseSpecs)
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;
}
