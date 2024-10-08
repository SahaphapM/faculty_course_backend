import { IsString } from 'class-validator';
import { Faculty } from 'src/entities/faculty.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Curriculum } from './curriculum.entity';
import { Department } from './department.entity';

@Entity()
export class Branch {
  @PrimaryColumn()
  id: string;

  @IsString()
  @Column()
  name: string;

  @ManyToOne(() => Faculty, (faculty) => faculty.branches)
  faculty: Faculty;

  @ManyToOne(() => Department, (department) => department.branches, {
    cascade: false,
  })
  department: Department;

  @OneToMany(() => Curriculum, (curriculum) => curriculum.branch, {
    cascade: false,
  })
  curriculums: Curriculum[];
}
