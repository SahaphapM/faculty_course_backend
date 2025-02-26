
import {ApiProperty} from '@nestjs/swagger'
import {Student} from './student.entity'
import {Course} from './course.entity'
import {Clo} from './clo.entity'
import {Skill} from './skill.entity'


export class SkillCollection {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
gained: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
expected: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
studentId: number ;
@ApiProperty({
  type: () => Student,
  required: false,
})
student?: Student ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
courseId: number ;
@ApiProperty({
  type: () => Course,
  required: false,
})
course?: Course ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
cloId: number ;
@ApiProperty({
  type: () => Clo,
  required: false,
})
clo?: Clo ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
skillId: number ;
@ApiProperty({
  type: () => Skill,
  required: false,
})
skill?: Skill ;
}
