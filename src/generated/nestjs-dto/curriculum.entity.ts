
import {ApiProperty} from '@nestjs/swagger'
import {CourseSpec} from './courseSpec.entity'
import {Branch} from './branch.entity'
import {CurriculumCoordinators} from './curriculumCoordinators.entity'
import {CurriculumSubjects} from './curriculumSubjects.entity'
import {Plo} from './plo.entity'
import {Skill} from './skill.entity'
import {Subject} from './subject.entity'


export class Curriculum {
  @ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engDegree: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
period: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
minimumGrade: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
branchId: number  | null;
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
  type: 'string',
  nullable: true,
})
thaiName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiDegree: string  | null;
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
  type: () => CourseSpec,
  isArray: true,
  required: false,
})
course_spec?: CourseSpec[] ;
@ApiProperty({
  type: () => Branch,
  required: false,
  nullable: true,
})
branch?: Branch  | null;
@ApiProperty({
  type: () => CurriculumCoordinators,
  isArray: true,
  required: false,
})
curriculum_coordinators?: CurriculumCoordinators[] ;
@ApiProperty({
  type: () => CurriculumSubjects,
  isArray: true,
  required: false,
})
curriculum_subjects?: CurriculumSubjects[] ;
@ApiProperty({
  type: () => Plo,
  isArray: true,
  required: false,
})
plo?: Plo[] ;
@ApiProperty({
  type: () => Skill,
  isArray: true,
  required: false,
})
skill?: Skill[] ;
@ApiProperty({
  type: () => Subject,
  isArray: true,
  required: false,
})
subject?: Subject[] ;
}
