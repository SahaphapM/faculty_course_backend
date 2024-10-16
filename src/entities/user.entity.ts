import { IsEmail, IsString, MinLength } from 'class-validator';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/entities/role.entity';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ select: false }) // select : false  It is hiding the password.
  @IsString()
  @MinLength(6)
  password: string;

  // @Column({ default: 'unknown.jpg' })
  // @IsString()
  // image: string;

  @Column({ default: 'unknown.jpg' })
  @IsString()
  avatarUrl: string;

  @ManyToMany(() => Role, (role) => role.users, { cascade: false })
  @JoinTable()
  roles: Role[];

  @Column({ nullable: true, select: false })
  hashedRefreshToken: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToOne(() => Teacher)
  @JoinColumn()
  teacher: Teacher;

  @OneToOne(() => Student)
  @JoinColumn()
  student: Student;
}
