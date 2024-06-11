import { Plo } from 'src/plos/entities/plo.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Clo {
  // CLO Class Learning Outcome
  @PrimaryColumn()
  id: string;

  @Column()
  description: string;

  @ManyToOne(() => Subject, (subject) => subject.clos)
  subject: Subject;

  @ManyToOne(() => Plo, (plo) => plo.clos)
  plo: Plo;
}
