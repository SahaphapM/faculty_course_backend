import { Subject } from 'src/subjects/entities/subject.entity';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Skill {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  colorsTag: string;

  @ManyToMany(() => Subject, (subject) => subject.skills)
  subjects: Subject[];
}
