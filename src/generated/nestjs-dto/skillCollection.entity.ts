
import {ApiProperty} from '@nestjs/swagger'
import {Clo} from './clo.entity'
import {Course} from './course.entity'
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
  type: 'boolean',
})
passed: boolean ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
cloId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
courseId: number  | null;
@ApiProperty({
  type: () => Clo,
  required: false,
  nullable: true,
})
clo?: Clo  | null;
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
}
