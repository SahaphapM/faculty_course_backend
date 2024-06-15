import { IsString } from 'class-validator';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Branch {
  @PrimaryColumn()
  id: string;

  @IsString()
  @Column()
  name: string;

  @ManyToOne(() => Faculty, (faculty) => faculty.branches)
  faculty: Faculty;

  // @ManyToOne(() => Department, (department) => department.branchs)
  // department: Department;

  @OneToMany(() => Curriculum, (curriculum) => curriculum.branch)
  curriculums: Curriculum[];
}