import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './branch.entity';

@Entity()
export class Faculty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  engName: string;

  @OneToMany(() => Branch, (branch) => branch.faculty)
  branches: Branch[];

  // @OneToMany(() => Department, (department) => department.faculty)
  // departments: Department[];

  // @OneToMany(() => Student, (student) => student.faculty)
  // students: Student[];
}
