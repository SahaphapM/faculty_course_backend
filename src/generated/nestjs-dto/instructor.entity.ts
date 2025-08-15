
import {ApiProperty} from '@nestjs/swagger'
import {CourseInstructor} from './courseInstructor.entity'
import {Branch} from './branch.entity'
import {User} from './user.entity'


export class Instructor {
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
branchId: number  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
code: string  | null;
@ApiProperty({
  type: 'string',
})
thaiName: string ;
@ApiProperty({
  type: 'string',
})
engName: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
tel: string  | null;
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
  type: () => CourseInstructor,
  isArray: true,
  required: false,
})
course_instructors?: CourseInstructor[] ;
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
