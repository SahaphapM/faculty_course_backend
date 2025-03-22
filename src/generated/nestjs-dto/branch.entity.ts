
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
  nullable: true,
})
thaiDescription: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engDescription: string  | null;
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
  isArray: true,
  required: false,
})
instructor?: Instructor[] ;
@ApiProperty({
  type: () => Student,
  isArray: true,
  required: false,
})
student?: Student[] ;
}
