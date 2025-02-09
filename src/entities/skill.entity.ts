import { TechSkill } from 'src/entities/tech-skill.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
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
  name: string;

  @Column({ nullable: true })
  thaiName: string;

  @Column({ nullable: true })
  engName: string;

  @Column({ nullable: true })
  thaiDescription: string;

  @Column({ nullable: true })
  engDescription: string;

  @Column({
    // enum: LearningDomain, //mysql/mariaDB not support
    default: LearningDomain.Psychomotor,
    nullable: true,
  })
  domain: LearningDomain;

  // Tree relation
  @TreeChildren({ cascade: false }) // delete parent not effect childs
  children: Skill[];

  @TreeParent()
  parent: Skill;

  @ManyToMany(() => TechSkill, (techSkill) => techSkill.skill, {
    cascade: false,
  })
  @JoinTable()
  techSkills: TechSkill[] | null;

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

  @OneToOne(() => Clo)
  @JoinColumn()
  clo: Clo;

  // I think it is not needed. We have skillExpectedLevels to relate to skill already.
  // @OneToMany(() => SkillCollection, (s) => s.courseEnrollment, {
  //   cascade: false,
  // })
  // skillCollections: SkillCollection[];
}
