import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Branch } from './branch.entity';

@Entity()
export class Faculty {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  engName: string;

  @OneToMany(() => Branch, (branch) => branch.faculty)
  branches: Branch[];

  // @OneToMany(() => Department, (department) => department.faculty)
  // departments: Department[];

  // @OneToMany(() => Student, (student) => student.faculty)
  // students: Student[];
}
