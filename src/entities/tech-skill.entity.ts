import { Skill } from 'src/entities/skill.entity';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class TechSkill {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Skill, (skill) => skill.techSkills)
  skill: Skill[];
}
