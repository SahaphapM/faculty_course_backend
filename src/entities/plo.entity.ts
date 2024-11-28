import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Clo } from './clo.entity';

@Entity()
// PLO Program Learning Outcome
export class Plo {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  num_plo: string;

  @Column()
  description: string;

  @Column()
  resultTypes: string;

  // @ManyToOne(() => Curriculum, (curriculum) => curriculum.plos)
  // curriculum: Curriculum;

  @OneToMany(() => Clo, (clo) => clo.plo, { cascade: true })
  clos: Clo[];
}
