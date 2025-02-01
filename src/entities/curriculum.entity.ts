import { Subject } from 'src/entities/subject.entity';
import { Instructor } from 'src/entities/instructor.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Plo } from './plo.entity';
import { Skill } from './skill.entity';
import { Coordinator } from './coordinator.entity';

@Entity()
export class Curriculum {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  engName: string;

  @Column()
  degree: string;

  @Column()
  engDegree: string;

  @ManyToOne(() => Branch, (branch) => branch.curriculums, {
    cascade: ['insert', 'update'],
  })
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

  @ManyToMany(() => Instructor, (ins) => ins.curriculums, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  coordinators: Coordinator[];

  @ManyToMany(() => Subject, (sub) => sub.curriculums, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  subjects: Subject[];

  @OneToMany(() => Skill, (sk) => sk.curriculums, {
    cascade: ['insert', 'update'],
  })
  skills: Skill[];
}
