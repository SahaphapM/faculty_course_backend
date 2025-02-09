import { Curriculum } from 'src/entities/curriculum.entity';
import { SubjectType } from 'src/enums/subject-types.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subject } from './subject.entity';

@Entity()
export class CourseSpec {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  engName: string;

  @Column()
  description: string;

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

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.courseSpecs)
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;
}
