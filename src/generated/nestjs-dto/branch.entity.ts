
import {ApiProperty} from '@nestjs/swagger'
import {Faculty} from './faculty.entity'
import {Curriculum} from './curriculum.entity'
import {Instructor} from './instructor.entity'
import {Student} from './student.entity'


export class Branch {
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
facultyId: number  | null;
@ApiProperty({
  type: 'string',
})
thaiDescription: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engDescription: string  | null;
@ApiProperty({
  type: 'string',
})
thaiName: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
abbrev: string  | null;
@ApiProperty({
  type: () => Faculty,
  required: false,
  nullable: true,
})
faculty?: Faculty  | null;
@ApiProperty({
  type: () => Curriculum,
  isArray: true,
  required: false,
})
curriculum?: Curriculum[] ;
@ApiProperty({
  type: () => Instructor,
  required: false,
  nullable: true,
})
instructor?: Instructor  | null;
@ApiProperty({
  type: () => Student,
  required: false,
  nullable: true,
})
student?: Student  | null;
}
