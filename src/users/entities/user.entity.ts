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

  @Column({ select: false }) // select : false  It is hiding the password.
  @IsString()
  @MinLength(6)
  password: string;

  @Column()
  @IsString()
  firstName: string;

  @Column({ nullable: true })
  @IsString()
  middleName: string;

  @Column()
  @IsString()
  lastName: string;

  @Column({ nullable: true })
  @IsString()
  gender: string;

  @Column({ nullable: true })
  @IsString()
  googleId: string;

  @Column({ nullable: true })
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
