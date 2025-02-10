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

@Entity()
export class Clo {
  // CLO Class Learning Outcome
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, type: 'text' })
  thaiDescription: string;

  @Column({ nullable: true, type: 'text' })
  engDescription: string;

  // courseSpec
  @ManyToOne(() => CourseSpec, (courseSpec) => courseSpec.clos)
  courseSpec: CourseSpec;

  // set relation with skill
  @OneToOne(() => Skill, (skill) => skill.clo)
  skill: Skill;

  @ManyToOne(() => Plo, (plo) => plo.clos, { nullable: true })
  plo: Plo;
}
