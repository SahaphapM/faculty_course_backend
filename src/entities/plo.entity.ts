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
  name: string;

  @Column({ nullable: true, type: 'text' })
  thaiDescription: string;

  // text log
  @Column({ nullable: true, type: 'text' })
  engDescription: string;

  @Column()
  type: string;

  @ManyToOne(() => Curriculum, (curriculum) => curriculum)
  @JoinColumn({ name: 'curriculumId' })
  curriculum: Curriculum;

  @OneToMany(() => Clo, (clo) => clo.plo, {
    cascade: false,
  })
  clos: Clo[];
}
