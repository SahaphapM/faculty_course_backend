import { Clo } from 'src/clos/entities/clo.entity';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Subject {
  @PrimaryColumn()
  id: string;

  @Column()
  thaiName: string;

  @Column()
  engName: string;

  @Column()
  description: string;

  @Column()
  credit: number;

  @Column()
  type: string;

  @Column()
  studyTime: string;

  @ManyToMany(() => Curriculum, (curriculum) => curriculum.subjects)
  curriculums: Curriculum[];

  @OneToMany(() => Clo, (clo) => clo.subject, { cascade: true }) // When subject was deleted those CLOs in subject will also be deleted.
  clos: Clo[];

  @ManyToMany(() => Skill, (skill) => skill.subjects, { cascade: true }) // When subject was deleted those Skills in subject will not be deleted.
  @JoinTable()
  skills: Skill[];
}
