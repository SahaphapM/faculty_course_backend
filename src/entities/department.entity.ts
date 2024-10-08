import { IsString } from 'class-validator';

import { Faculty } from 'src/entities/faculty.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Branch } from './branch.entity';

@Entity()
export class Department {
  @PrimaryColumn()
  id: string;

  @IsString()
  @Column()
  name: string;

  @OneToMany(() => Branch, (branch) => branch.department)
  branches: Branch[];

  @ManyToOne(() => Faculty, (faculty) => faculty.departments, { cascade: true })
  faculty: Faculty;
}
