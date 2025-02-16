
import {ApiProperty} from '@nestjs/swagger'
import {CourseEnrollment} from './courseEnrollment.entity'
import {SkillExpectedLevel} from './skillExpectedLevel.entity'
import {Student} from './student.entity'


export class SkillCollection {
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
studentId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
gainedLevel: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
passed: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
ExpectedLevelId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
courseEnrollmentId: number  | null;
@ApiProperty({
  type: () => CourseEnrollment,
  required: false,
  nullable: true,
})
course_enrollment?: CourseEnrollment  | null;
@ApiProperty({
  type: () => SkillExpectedLevel,
  required: false,
  nullable: true,
})
skill_expected_level?: SkillExpectedLevel  | null;
@ApiProperty({
  type: () => Student,
  required: false,
  nullable: true,
})
student?: Student  | null;
}
