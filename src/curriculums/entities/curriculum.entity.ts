import { Branch } from 'src/branchs/entities/branch.entity';
import { Plo } from 'src/plos/entities/plo.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

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

  @ManyToMany(() => Subject, (subject) => subject.curriculums, {
    cascade: false,
  })
  @JoinTable()
  subjects: Subject[];
}
