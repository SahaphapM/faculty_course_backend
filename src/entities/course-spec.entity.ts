import { Curriculum } from 'src/entities/curriculum.entity';
import { Subject } from 'src/entities/subject.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class CourseSpec {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Subject, (subject) => subject.courseSpecs)
  subject: Subject;

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.courseSpecs)
  curriculum: Curriculum;
}
