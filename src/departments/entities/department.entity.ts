import { IsString } from 'class-validator';
import { Branch } from 'src/branchs/entities/branch.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

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
