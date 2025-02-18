
import {ApiProperty} from '@nestjs/swagger'


export class SkillDto {
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
  type: 'string',
})
engName: string ;
@ApiProperty({
  type: 'string',
})
thaiDescription: string ;
@ApiProperty({
  type: 'string',
})
engDescription: string ;
@ApiProperty({
  type: 'string',
})
domain: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
parentId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
cloId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
curriculumId: number ;
}
