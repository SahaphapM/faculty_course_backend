import { Clo } from 'src/clos/entities/clo.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { SkillDetail } from 'src/skills/entities/skillDetail.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';

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

  @ManyToMany(() => Curriculum, (curriculum) => curriculum.subjects)
  curriculums: Curriculum[];

  @OneToMany(() => Clo, (clo) => clo.subject, { cascade: true })
  clos: Clo[];

  @OneToMany(() => Course, (course) => course.subject)
  courses: Course[];
}
