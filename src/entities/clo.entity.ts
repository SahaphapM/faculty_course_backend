import { Plo } from 'src/entities/plo.entity';
import { Subject } from 'src/entities/subject.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Clo {
  // CLO Class Learning Outcome
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
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
