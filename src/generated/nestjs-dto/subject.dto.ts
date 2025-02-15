
import {ApiProperty} from '@nestjs/swagger'


export class SubjectDto {
  @ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
})
code: string ;
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
curriculumId: number  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiName: string  | null;
}
