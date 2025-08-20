
import {ApiProperty} from '@nestjs/swagger'
import {Internship} from './internship.entity'
import {JobPosition} from './jobPosition.entity'
import {Student} from './student.entity'


export class StudentInternship {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'boolean',
})
isAssessed: boolean ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
studentId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
jobPositionId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
internshipId: number  | null;
@ApiProperty({
  type: () => Internship,
  required: false,
  nullable: true,
})
internship?: Internship  | null;
@ApiProperty({
  type: () => JobPosition,
  required: false,
  nullable: true,
})
jobPosition?: JobPosition  | null;
@ApiProperty({
  type: () => Student,
  required: false,
  nullable: true,
})
student?: Student  | null;
}
