import { IsString } from 'class-validator';
import { Branch } from 'src/branchs/entities/branch.entity';
import { Department } from 'src/departments/entities/department.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

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

  @OneToMany(() => User, (user) => user.faculty)
  users: User[];
}
