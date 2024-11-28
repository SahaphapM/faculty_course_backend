
import { Subject } from 'src/entities/subject.entity';
import { Instructor } from 'src/entities/instructor.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Branch } from './branch.entity';

@Entity()
export class Curriculum {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  engName: string;

  @Column()
  degreeName: string;

  @Column()
  engDegreeName: string;

  @ManyToOne(() => Branch, (branch) => branch.curriculums)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column()
  description: string;

  @Column()
  period: number;

  @Column()
  minimumGrade: number;

  // @OneToMany(() => Plo, (plo) => plo.curriculum, { cascade: true })
  // plos: Plo[];

  @ManyToMany(() => Instructor, (teacher) => teacher.curriculums, {
    cascade: false,
  })
  @JoinTable()
  coordinators: Instructor[];

  @ManyToMany(() => Subject, (subject) => subject.curriculums)
  @JoinTable()
  subjects: Subject[];
}
