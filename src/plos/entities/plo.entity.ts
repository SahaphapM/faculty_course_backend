import { Clo } from 'src/clos/entities/clo.entity';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
// PLO Program Learning Outcome
export class Plo {
  @PrimaryColumn()
  id: string;

  @Column()
  description: string;

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.plos)
  curriculum: Curriculum;

  @OneToMany(() => Clo, (clo) => clo.plo)
  clos: Clo[];
}
