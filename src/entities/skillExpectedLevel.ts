import { Subject } from 'src/entities/subject.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Skill } from './skill.entity';
import { OneToMany } from 'typeorm';
import { SkillCollection } from 'src/entities/skill-collection.entity';

@Entity()
export class SkillExpectedLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  expectedLevel: number; // level 1-5

  @ManyToOne(() => Subject, (subject) => subject.skillExpectedLevels)
  @JoinColumn({ name: 'subjectId' })
  subjects: Subject;

  @ManyToOne(() => Skill, (skill) => skill.skillExpectedLevels)
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @OneToMany(
    () => SkillCollection,
    (skillCollection) => skillCollection.skillExpectedLevels,
    {
      cascade: false,
    },
  )
  skillCollection: SkillCollection[];
}
