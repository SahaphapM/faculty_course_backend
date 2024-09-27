import { IsEmail, IsString, MinLength } from 'class-validator';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Role } from 'src/roles/entities/role.entity';

@Entity()
export class Teacher {
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

  @ManyToMany(() => Role, (role) => role.teachers)
  @JoinTable()
  roles: Role[];

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @ManyToMany(() => Curriculum, (curriculum) => curriculum.coordinators)
  curriculums: Curriculum[];

  // @ManyToMany(() => Subject, (subject) => subject.teachers)
  // subjects: Subject[];
}
