import { Clo } from 'src/clos/entities/clo.entity';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';

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

  @OneToMany(() => Clo, (clo) => clo.subject)
  clos: Clo[];
}
