
import {ApiProperty} from '@nestjs/swagger'


export class SkillCollectionDto {
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
  type: 'integer',
  format: 'int32',
})
courseId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
cloId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
skillId: number ;
}
