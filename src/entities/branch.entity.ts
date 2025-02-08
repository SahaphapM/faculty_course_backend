import { Faculty } from 'src/entities/faculty.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Curriculum } from './curriculum.entity';
@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  engName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, length: 10 })
  abbrev: string; //CS, AI, SE etc.

  @ManyToOne(() => Faculty, (faculty) => faculty.branches, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  @OneToMany(() => Curriculum, (curriculum) => curriculum.branch, {
    cascade: false,
  })
  curriculums: Curriculum[];
}
