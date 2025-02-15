
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
name: string ;
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
