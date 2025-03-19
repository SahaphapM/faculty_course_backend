
import {ApiProperty} from '@nestjs/swagger'


export class CourseDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'boolean',
  nullable: true,
})
active: boolean  | null;
@ApiProperty({
  type: 'string',
})
semester: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
year: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
subjectId: number ;
}
