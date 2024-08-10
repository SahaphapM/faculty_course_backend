import { Subject } from 'src/subjects/entities/subject.entity';
import { TechSkill } from 'src/tech-skills/entities/tech-skill.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity()
@Tree('closure-table')
export class Skill {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Subject, (subject) => subject.skills)
  subjects: Subject[];

  // It self Relation
  // @ManyToMany(() => Skill, (skill) => skill.relatedSkills)
  // @JoinTable({
  //   name: 'skill_relations', // Table to store the relations
  //   joinColumn: { name: 'skillId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'relatedSkillId', referencedColumnName: 'id' },
  // })
  // relatedSkills: Skill[];

  // @ManyToMany(() => Skill, (skill) => skill.relatedSkills)
  // inverseRelatedSkills: Skill[];

  // Tree relation
  @TreeChildren({ cascade: false }) // delete parent not effect childs
  children: Skill[];

  @TreeParent()
  parent: Skill[];

  @ManyToMany(() => TechSkill, (techSkill) => techSkill.skill, {
    cascade: false,
  })
  @JoinTable()
  techSkills: TechSkill[];
}
