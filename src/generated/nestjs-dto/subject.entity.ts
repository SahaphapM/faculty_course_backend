
import {ApiProperty} from '@nestjs/swagger'
import {Clo} from './clo.entity'
import {Lesson} from './lesson.entity'
import {Curriculum} from './curriculum.entity'
import {CurriculumSubjects} from './curriculumSubjects.entity'
import {SkillExpectedLevel} from './skillExpectedLevel.entity'


export class Subject {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
curriculumId: number  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
credit: string  | null;
@ApiProperty({
  type: 'string',
})
type: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiDescription: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engDescription: string  | null;
@ApiProperty({
  type: () => Clo,
  isArray: true,
  required: false,
})
clo?: Clo[] ;
@ApiProperty({
  type: () => Lesson,
  required: false,
  nullable: true,
})
lesson?: Lesson  | null;
@ApiProperty({
  type: () => Curriculum,
  required: false,
  nullable: true,
})
curriculum?: Curriculum  | null;
@ApiProperty({
  type: () => CurriculumSubjects,
  isArray: true,
  required: false,
})
curriculum_subjects?: CurriculumSubjects[] ;
@ApiProperty({
  type: () => SkillExpectedLevel,
  isArray: true,
  required: false,
})
skill_expected_level?: SkillExpectedLevel[] ;
}
