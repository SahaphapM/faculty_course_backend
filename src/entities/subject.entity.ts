import { Clo } from 'src/entities/clo.entity';
import { Course } from 'src/entities/course.entity';
import { Curriculum } from 'src/entities/curriculum.entity';
import { SkillExpectedLevel } from 'src/entities/skill-exp-lvl';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SubjectType } from 'src/enums/subject-types.enum';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;
  // define id by user
  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  engName: string;

  @Column()
  description: string;

  @Column()
  credit: string; //3 (2-2-5)

  @Column({
    // enum: SubjectType, // DB not support
    default: SubjectType.Compulsory,
  })
  type: SubjectType;

  @OneToMany(
    () => SkillExpectedLevel,
    (skillExpectedLevel) => skillExpectedLevel.subject,
    {
      cascade: true,
    },
  )
  skillExpectedLevels: SkillExpectedLevel[];

  @ManyToMany(() => Curriculum, (curriculum) => curriculum.subjects)
  curriculums: Curriculum[];

  @OneToMany(() => Clo, (clo) => clo.subject, { cascade: true })
  clos: Clo[];

  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];
}
