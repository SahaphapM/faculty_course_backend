import { Plo } from 'src/entities/plo.entity';
import { Subject } from 'src/entities/subject.entity';
import { Teacher } from 'src/entities/teacher.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Branch } from './branch.entity';

@Entity()
export class Curriculum {
  @PrimaryColumn()
  id: string;

  @Column()
  thaiName: string;

  @Column()
  engName: string;

  @Column()
  thaiDegreeName: string;

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

  @OneToMany(() => Plo, (plo) => plo.curriculum, { cascade: true })
  plos: Plo[];

  @ManyToMany(() => Teacher, (teacher) => teacher.curriculums, {
    cascade: false,
  })
  @JoinTable()
  coordinators: Teacher[];

  @ManyToMany(() => Subject, (subject) => subject.curriculums)
  @JoinTable()
  subjects: Subject[];
}
