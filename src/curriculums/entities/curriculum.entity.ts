import { Branch } from 'src/branchs/entities/branch.entity';
import { Plo } from 'src/plos/entities/plo.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
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
  phdName: string;

  @Column()
  degreeName: string;

  @ManyToOne(() => Branch, (branch) => branch.curriculums)
  branch: Branch;

  @Column()
  description: string;

  @Column()
  period: number;

  @Column()
  minimumGrade: number;

  @OneToMany(() => Plo, (plo) => plo.curriculum)
  plos: Plo[];

  @ManyToMany(() => User, (user) => user.curriculums)
  coordinator: User[];

  @ManyToMany(() => Subject, (subject) => subject.curriculums)
  subjects: Subject[];
}
