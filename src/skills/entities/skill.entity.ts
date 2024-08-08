import { Subject } from 'src/subjects/entities/subject.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
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
  @ManyToMany(() => Skill, (skill) => skill.relatedSkills)
  @JoinTable({
    name: 'skill_relations', // Table to store the relations
    joinColumn: { name: 'skillId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'relatedSkillId', referencedColumnName: 'id' },
  })
  relatedSkills: Skill[];

  @ManyToMany(() => Skill, (skill) => skill.relatedSkills)
  inverseRelatedSkills: Skill[];
}
