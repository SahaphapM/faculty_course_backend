import { IsString } from 'class-validator';

import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Branch } from './branch.entity';
import { Department } from './department.entity';

@Entity()
export class Faculty {
  @PrimaryColumn()
  id: string;

  @IsString()
  @Column()
  name: string;

  @OneToMany(() => Branch, (branch) => branch.faculty)
  branches: Branch[];

  @OneToMany(() => Department, (department) => department.faculty)
  departments: Department[];

  // @OneToMany(() => Student, (student) => student.faculty)
  // students: Student[];
}
