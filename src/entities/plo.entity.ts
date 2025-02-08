import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Curriculum } from './curriculum.entity';
import { Clo } from './clo.entity';

@Entity()
// PLO Program Learning Outcome
export class Plo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  num_plo: string;

  @Column()
  description: string;

  @Column()
  resultTypes: string;

  @ManyToOne(() => Curriculum, (curriculum) => curriculum)
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;

  @OneToMany(() => Clo, (clo) => clo.plo, { cascade: true })
  clos: Clo[];
}
