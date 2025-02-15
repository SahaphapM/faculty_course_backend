
import {ApiProperty} from '@nestjs/swagger'
import {CourseInstructor} from './courseInstructor.entity'
import {CurriculumCoordinators} from './curriculumCoordinators.entity'
import {Branch} from './branch.entity'
import {User} from './user.entity'


export class Instructor {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
tel: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
picture: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
position: string  | null;
@ApiProperty({
  type: 'string',
})
email: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
officeRoom: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
specialists: string  | null;
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
  type: 'string',
  nullable: true,
})
thaiName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
bio: string  | null;
@ApiProperty({
  type: () => CourseInstructor,
  isArray: true,
  required: false,
})
course_instructors?: CourseInstructor[] ;
@ApiProperty({
  type: () => CurriculumCoordinators,
  isArray: true,
  required: false,
})
curriculums?: CurriculumCoordinators[] ;
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
