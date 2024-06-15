import { IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryColumn()
  @IsString()
  id: string;

  @IsString()
  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
