import { Course } from 'src/courses/entities/course.entity';
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

  @Column({ nullable: true })
  level: number; // level 1-5

  @ManyToMany(() => Subject, (subject) => subject.skills)
  subjects: Subject[] | null;

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

  @ManyToMany(() => Course, (course) => course.skills, {
    cascade: false,
  })
  @JoinTable()
  courses: Course[];
}
