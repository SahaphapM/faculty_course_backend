import { Subject } from 'src/subjects/entities/subject.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Skill } from './skill.entity';
import { OneToMany } from 'typeorm';
import { SkillCollection } from 'src/students/entities/skil-collection';

@Entity()
export class SkillDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ nullable: true })
  level: number; // level 1-5

  @ManyToOne(() => Subject, (subject) => subject.skillDetails)
  subjects: Subject;

  @ManyToOne(() => Skill, (skill) => skill.skillDetail)
  skill: Skill;

  @OneToMany(() => SkillCollection, (skillCollection) => skillCollection.skillDetail, {
    cascade: false,
  })
  skillCollection: SkillCollection[];
}
