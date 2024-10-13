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
import { Course } from './course.entity';

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

  @Column()
  position: string;

  @OneToOne(() => User)
  user: User;

  @Column()
  email: string;

  @Column({ nullable: true })
  officeRoom: string;

  @Column({ nullable: true })
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

  @ManyToMany(() => Teacher, (teacher) => teacher.courses)
  courses: Course[];
}
