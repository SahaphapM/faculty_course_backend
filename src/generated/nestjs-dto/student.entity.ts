
import {ApiProperty} from '@nestjs/swagger'
import {CourseEnrollment} from './courseEnrollment.entity'
import {SkillCollection} from './skillCollection.entity'
import {Branch} from './branch.entity'
import {User} from './user.entity'


export class Student {
  @ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
enrollmentDate: Date  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
socials: string  | null;
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
})
thaiName: string ;
@ApiProperty({
  type: () => CourseEnrollment,
  isArray: true,
  required: false,
})
course_enrollments?: CourseEnrollment[] ;
@ApiProperty({
  type: () => SkillCollection,
  isArray: true,
  required: false,
})
skill_collections?: SkillCollection[] ;
@ApiProperty({
  type: () => Branch,
  required: false,
  nullable: true,
})
branch?: Branch  | null;
@ApiProperty({
  type: () => User,
  required: false,
  nullable: true,
})
user?: User  | null;
}
