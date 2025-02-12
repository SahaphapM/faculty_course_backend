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
import { CourseSpec } from './course-spec.entity';

@Entity()
export class Curriculum {
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
  thaiDegree: string;

  @Column({ nullable: true })
  engDegree: string;

  @ManyToOne(() => Branch, (branch) => branch.curriculums, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ nullable: true, type: 'longtext' })
  thaiDescription: string;

  @Column({ nullable: true, type: 'longtext' })
  engDescription: string;

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

  @OneToMany(() => Subject, (sub) => sub.curriculum, {
    cascade: ['insert', 'update'],
  })
  subjects: Subject[];

  @OneToMany(() => Skill, (sk) => sk.curriculum, {
    cascade: ['insert', 'update'],
  })
  skills: Skill[];

  @OneToMany(() => CourseSpec, (cs) => cs.curriculum, {
    cascade: ['insert', 'update'],
  })
  courseSpecs: CourseSpec[];
}
