import { Subject } from 'src/subjects/entities/subject.entity';
import { Column, Entity, ManyToMany,  PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Subject, (subject) => subject.skills)
  subjects: Subject[];
}
