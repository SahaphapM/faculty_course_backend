import { Skill } from 'src/entities/skill.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TechSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Skill, (skill) => skill.techSkills)
  skill: Skill[];
}
