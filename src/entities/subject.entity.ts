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
import { Skill, SkillDomain } from './skill.entity';

@Entity()
export class Subject {
  @PrimaryColumn()
  id: string;

  @Column()
  thaiName: string;

  @Column()
  engName: string;

  @Column()
  description: string;

  @Column()
  credit: number;

  @Column()
  type: string;

  @Column()
  studyTime: string;

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

export interface SkillMapping {
  id?: number;
  subjectId: string;
  skillId: number;
  skillName: string;
  skillDomain: SkillDomain;
  expectedLevel: 1 | 2 | 3 | 4 | 5;
  expectedMean: ExpectedMean;
}

export enum ExpectedMean {
  The1Basic = '1 - Basic',
  The1Imitation = '1 - Imitation',
  The2Intermediate = '2 - Intermediate',
  The2Manipulation = '2 - Manipulation',
  The2Understand = '2 - Understand',
  The3Apply = '3 - Apply',
  The3Precision = '3 - Precision',
}
