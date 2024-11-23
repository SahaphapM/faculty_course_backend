import { Faculty } from 'src/entities/faculty.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Curriculum } from './curriculum.entity';
@Entity()
export class Branch {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  engName: string;

  @Column({ nullable: true })
  abbrev: string; //CS, AI, SE etc.

  @ManyToOne(() => Faculty, (faculty) => faculty.branches)
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
