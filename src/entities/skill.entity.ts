import { TechSkill } from 'src/entities/tech-skill.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { SkillExpectedLevel } from './skillExpectedLevel';
import { SkillCollection } from './skill-collection.entity';
import { LearningDomain } from 'src/enums/learning-domain.enum';

@Entity()
@Tree('closure-table')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

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

  @OneToMany(
    () => SkillExpectedLevel,
    (skillExpectedLevel) => skillExpectedLevel.skill,
    {
      cascade: false,
    },
  )
  skillExpectedLevels: SkillExpectedLevel[];

  @OneToMany(() => SkillCollection, (s) => s.courseEnrollment, {
    cascade: false,
  })
  skillCollections: SkillCollection[];
}
