import { Subject } from 'src/subjects/entities/subject.entity';
import { TechSkill } from 'src/tech-skills/entities/tech-skill.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  level: number; // level 1-5

  @ManyToMany(() => Subject, (subject) => subject.skills)
  subjects: Subject[] | null;

  // Self Relation
  @ManyToMany(() => Skill, (skill) => skill.relatedSkills)
  @JoinTable({
    name: 'skill_relations', // Table to store the relations
    joinColumn: { name: 'skillId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'relatedSkillId', referencedColumnName: 'id' },
  })
  relatedSkills: Skill[] | null;

  // @ManyToMany(() => Skill, (skill) => skill.relatedSkills)
  // inverseRelatedSkills: Skill[];

  @ManyToMany(() => TechSkill, (techSkill) => techSkill.skill, {
    cascade: false,
  })
  @JoinTable()
  techSkills: TechSkill[] | null;
}
