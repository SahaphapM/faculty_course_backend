
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
}
