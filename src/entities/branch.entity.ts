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
  abbrev: string; //CS, AI, SE etc.

  @ManyToOne(() => Faculty, (faculty) => faculty.branches, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'facultyId' })
  faculty: Faculty;

  // @ManyToOne(() => Department, (department) => department.branches, {
  //   cascade: false,
  // })
  // @JoinColumn({ name: 'departmentId' })
  // department: Department;

  @OneToMany(() => Curriculum, (curriculum) => curriculum.branch, {
    cascade: false,
  })
  curriculums: Curriculum[];
}
