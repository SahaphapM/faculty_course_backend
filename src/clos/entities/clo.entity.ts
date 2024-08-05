import { Plo } from 'src/plos/entities/plo.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Clo {
  // CLO Class Learning Outcome
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => Subject, (subject) => subject.clos, {
    onDelete: 'CASCADE', // When delete from root of relation that relate row will be deleted
  })
  subject: Subject;

  @ManyToOne(() => Plo, (plo) => plo.clos)
  plo: Plo | null;
}
