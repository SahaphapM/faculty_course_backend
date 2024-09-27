import { IsString } from 'class-validator';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import { User } from 'src/users/entities/user.entity';
// import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: string;

  @IsString()
  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Teacher, (teacher) => teacher.roles)
  teachers: Teacher[];
}
