import { IsString } from 'class-validator';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Department } from 'src/departments/entities/department.entity';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { User } from 'src/users/entities/user.entity';
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

  @ManyToOne(() => Department, (department) => department.branches, {
    cascade: true,
  })
  department: Department;

  @OneToMany(() => Curriculum, (curriculum) => curriculum.branch, {
    cascade: true,
  })
  curriculums: Curriculum[];

  @OneToMany(() => User, (user) => user.branch)
  users: User[];
}
