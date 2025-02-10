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
export class Instructor {
  @PrimaryGeneratedColumn()
  id: number;
  // define id by user
  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  thaiName: string;

  @Column({ nullable: true })
  engName: string;

  @Column({ nullable: true })
  tel: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
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

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @OneToOne(() => Branch)
  @JoinColumn()
  branch: Branch;

  @ManyToMany(() => Curriculum, (curriculum) => curriculum.coordinators)
  curriculums: Curriculum[];

  @ManyToMany(() => Course, (c) => c.instructors)
  courses: Course[];
}
