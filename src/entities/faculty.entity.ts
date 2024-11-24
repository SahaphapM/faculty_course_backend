import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Branch } from './branch.entity';

@Entity()
export class Faculty {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  engName: string;

  @OneToMany(() => Branch, (branch) => branch.faculty, { cascade: true })
  branches: Branch[];

  // @OneToMany(() => Department, (department) => department.faculty)
  // departments: Department[];

  // @OneToMany(() => Student, (student) => student.faculty)
  // students: Student[];
}
