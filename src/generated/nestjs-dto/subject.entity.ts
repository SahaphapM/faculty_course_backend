
import {ApiProperty} from '@nestjs/swagger'
import {Course} from './course.entity'
import {CourseSpec} from './courseSpec.entity'
import {CurriculumSubjects} from './curriculumSubjects.entity'
import {SkillExpectedLevel} from './skillExpectedLevel.entity'
import {Curriculum} from './curriculum.entity'


export class Subject {
  @ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
})
code: string ;
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
  type: () => Course,
  isArray: true,
  required: false,
})
course?: Course[] ;
@ApiProperty({
  type: () => CourseSpec,
  isArray: true,
  required: false,
})
course_spec?: CourseSpec[] ;
@ApiProperty({
  type: () => CurriculumSubjects,
  isArray: true,
  required: false,
})
curriculum_subjects_subject?: CurriculumSubjects[] ;
@ApiProperty({
  type: () => SkillExpectedLevel,
  isArray: true,
  required: false,
})
skill_expected_level?: SkillExpectedLevel[] ;
@ApiProperty({
  type: () => Curriculum,
  required: false,
  nullable: true,
})
curriculum?: Curriculum  | null;
}
