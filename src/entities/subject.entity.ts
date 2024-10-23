import { Clo } from 'src/entities/clo.entity';
import { Course } from 'src/entities/course.entity';
import { Curriculum } from 'src/entities/curriculum.entity';
import { SkillDetail } from 'src/entities/skillDetail.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Skill } from './skill.entity';
import { SubjectType } from 'src/enums/subject-types.enum';

@Entity()
export class Subject {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  engName: string;

  @Column()
  description: string;

  @Column()
  credit: string; //3 (2-2-5)

  @Column({
    enum: SubjectType,
    default: SubjectType.Compulsory,
  })
  type: SubjectType;

  @OneToMany(() => SkillDetail, (skillDetail) => skillDetail.subjects, {
    cascade: false,
  })
  skillDetails: SkillDetail[];

  @ManyToMany(() => Skill, (s) => s.subjects, {
    cascade: false,
  })
  @JoinTable()
  skills: Skill[];

  @ManyToMany(() => Curriculum, (curriculum) => curriculum.subjects)
  curriculums: Curriculum[];

  @OneToMany(() => Clo, (clo) => clo.subject, { cascade: true })
  clos: Clo[];

  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];
}
