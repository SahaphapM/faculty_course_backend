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
import { SkillDetail } from './skillDetail.entity';
import { SkillCollection } from './skill-collection.entity';
import { Subject } from './subject.entity';
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
    enum: LearningDomain,
    default: LearningDomain.Psychomotor,
    nullable: true,
  })
  domain: LearningDomain;
  // @ManyToMany(() => Subject, (subject) => subject.skills)
  // subjects: Subject[] | null;

  // Self Relation
  // @ManyToMany(() => Skill, (skill) => skill.subSkills)
  // @JoinTable({
  //   name: 'skill_relations', // Table to store the relations
  //   joinColumn: { name: 'skillId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'relatedSkillId', referencedColumnName: 'id' },
  // })
  // subSkills: Skill[] | null;

  // @ManyToMany(() => Skill, (skill) => skill.relatedSkills)
  // inverseRelatedSkills: Skill[];

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

  @ManyToMany(() => Subject, (s) => s.skills, {
    cascade: false,
  })
  subjects: Subject[];

  // @ManyToMany(() => Course, (course) => course.skills, {
  //   cascade: false,
  // })
  // @JoinTable()
  // courses: Course[];

  @OneToMany(() => SkillDetail, (skillDetail) => skillDetail.skill, {
    cascade: false,
  })
  skillDetail: SkillDetail[];

  @OneToMany(() => SkillCollection, (s) => s.courseEnrollment, {
    cascade: false,
  })
  skillCollections: SkillCollection[];
}
