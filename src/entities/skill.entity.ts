import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { SkillExpectedLevel } from './skill-exp-lvl';
import { LearningDomain } from 'src/enums/learning-domain.enum';
import { Curriculum } from './curriculum.entity';
import { Clo } from './clo.entity';
import { Exclude } from 'class-transformer';

@Entity()
@Tree('closure-table')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  thaiName: string;

  @Column({ nullable: true })
  engName: string;

  @Column({ nullable: true, type: 'text' })
  thaiDescription: string;

  @Column({ nullable: true, type: 'text' })
  engDescription: string;

  @Column({
    default: LearningDomain.Psychomotor,
    nullable: true,
  })
  domain: LearningDomain;

  // Tree relation
  @TreeChildren({ cascade: ['insert', 'update'] }) // delete parent not effect childs
  children: Skill[];

  @TreeParent()
  parent: Skill;

  @ManyToOne(() => Curriculum, (cr) => cr.skills, {
    cascade: false,
  })
  @JoinColumn()
  @Exclude()
  curriculum: Curriculum;

  @OneToMany(
    () => SkillExpectedLevel,
    (skillExpectedLevel) => skillExpectedLevel.skill,
    {
      cascade: false,
    },
  )
  skillExpectedLevels: SkillExpectedLevel[];

  @OneToOne(() => Clo, (clo) => clo.skill, {
    cascade: false,
  })
  @JoinColumn({ name: 'cloId' })
  clo: Clo;

  // I think it is not needed. We have skillExpectedLevels to relate to skill already.
  // @OneToMany(() => SkillCollection, (s) => s.courseEnrollment, {
  //   cascade: false,
  // })
  // skillCollections: SkillCollection[];
}
