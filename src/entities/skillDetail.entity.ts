import { Subject } from 'src/entities/subject.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Skill } from './skill.entity';
import { OneToMany } from 'typeorm';
import { SkillCollection } from 'src/entities/skil-collection.entity';

@Entity()
export class SkillDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ nullable: true })
  requiredLevel: number; // level 1-5

  @ManyToOne(() => Subject, (subject) => subject.skillDetails)
  subjects: Subject;

  @ManyToOne(() => Skill, (skill) => skill.skillDetail)
  skill: Skill;

  @OneToMany(
    () => SkillCollection,
    (skillCollection) => skillCollection.skillDetail,
    {
      cascade: false,
    },
  )
  skillCollection: SkillCollection[];
}
