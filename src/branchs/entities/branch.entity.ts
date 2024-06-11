import { IsString } from 'class-validator';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Branch {
  @PrimaryColumn()
  id: string;

  @IsString()
  @Column()
  name: string;

  // @ManyToOne(() => Faculty, (faculty) => faculty.branchs)
  // faculty: Faculty;

  // @ManyToOne(() => Department, (department) => department.branchs)
  // department: Department;

  @OneToMany(() => Curriculum, (curriculum) => curriculum.branch)
  curriculums: Curriculum[];
}
