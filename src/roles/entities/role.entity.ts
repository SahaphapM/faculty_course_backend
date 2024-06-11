import { IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryColumn()
  id: string;

  @IsString()
  @Column()
  name: string;

  // @ManyToOne(() => Faculty, (faculty) => faculty.branchs)
  // faculty: Faculty;

  // @ManyToOne(() => Department, (department) => department.branchs)
  // department: Department;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
