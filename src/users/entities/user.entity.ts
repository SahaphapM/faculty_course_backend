import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @MinLength(6)
  password: string;

  @Column()
  @IsString()
  firstName: string;

  @Column()
  @IsString()
  middleName: string;

  @Column()
  @IsString()
  lastName: string;

  @Column()
  @IsString()
  gender: string;

  @Column()
  @IsPhoneNumber()
  @MinLength(10)
  @MaxLength(10)
  phone: string;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable()
  roles: Role[];

  @ManyToMany(() => Curriculum, (curriculum) => curriculum.coordinators)
  curriculums: Curriculum[];
}
