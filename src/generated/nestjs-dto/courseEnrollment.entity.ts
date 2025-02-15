
import {ApiProperty} from '@nestjs/swagger'
import {Course} from './course.entity'
import {Student} from './student.entity'
import {SkillCollection} from './skillCollection.entity'


export class CourseEnrollment {
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
courseId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
studentId: number  | null;
@ApiProperty({
  type: () => Course,
  required: false,
  nullable: true,
})
course?: Course  | null;
@ApiProperty({
  type: () => Student,
  required: false,
  nullable: true,
})
student?: Student  | null;
@ApiProperty({
  type: () => SkillCollection,
  isArray: true,
  required: false,
})
skill_collections?: SkillCollection[] ;
}
