import { Curriculum } from 'src/entities/curriculum.entity';
import { SubjectType } from 'src/enums/subject-types.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Subject } from './subject.entity';
import { Clo } from './clo.entity';

@Entity()
export class CourseSpec {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  thaiName: string;

  @Column({ nullable: true })
  engName: string;

  @Column({ nullable: true })
  thaiDescription: string;

  @Column({ nullable: true })
  engDescription: string;

  @Column()
  credit: string; //3 (2-2-5)

  @Column({
    // enum: SubjectType, // DB not support
    default: SubjectType.Compulsory,
  })
  type: SubjectType;

  @Column()
  subjectCode: string; // คอลัมน์ที่ใช้เชื่อมโยงกับ Subject.code

  @Column()
  curriculumId: number;

  // ความสัมพันธ์กับ Subject
  @ManyToOne(() => Subject, (subject) => subject.courseSpecs)
  @JoinColumn({ name: 'subjectCode', referencedColumnName: 'code' }) // ระบุคอลัมน์ที่เชื่อมโยง
  subject: Subject;

  // ความสัมพันธ์กับ Clo
  @OneToMany(() => Clo, (clo) => clo.courseSpec, { nullable: true })
  clos: Clo[];

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.courseSpecs)
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;
}
