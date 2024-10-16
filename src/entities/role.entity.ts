import { IsString } from 'class-validator';
import { User } from 'src/entities/user.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column()
  name: string;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
