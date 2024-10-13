import { IsEmail } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Curriculum } from 'src/entities/curriculum.entity';
import { User } from './user.entity';
import { Branch } from './branch.entity';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  engName: string;

  @Column()
  tel: string;

  @Column({ default: 'unknown.jpg' })
  picture: string;

  @OneToOne(() => User)
  user: User;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  officeRoom: string;

  @Column()
  specialists: string;

  @Column({ nullable: true })
  socials: string;

  @Column({ nullable: true })
  bio: string;

  @OneToOne(() => Branch)
  @JoinColumn()
  branch: Branch;

  @ManyToMany(() => Curriculum, (curriculum) => curriculum.coordinators)
  curriculums: Curriculum[];
}
