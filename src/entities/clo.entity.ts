import { Plo } from 'src/entities/plo.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseSpec } from './course-spec.entity';
import { Skill } from './skill.entity';
import { Subject } from './subject.entity';

@Entity()
export class Clo {
  // CLO Class Learning Outcome
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  thaiDescription: string;

  @Column({ nullable: true })
  engDescription: string;

  // courseSpec
  @ManyToOne(() => CourseSpec, (courseSpec) => courseSpec.clos)
  courseSpec: CourseSpec;

  // set relation with skill
  @OneToOne(() => Skill, (skill) => skill.clo)
  skill: Skill;

  @ManyToOne(() => Plo, (plo) => plo.clos, { nullable: true })
  plo: Plo;

  ///////////// wait for delete becuase subject no longer use with clo //////////////
  @ManyToOne(() => Subject, (subject) => subject.clos, { nullable: true })
  subject: Subject;
}
