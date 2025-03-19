
import {ApiProperty} from '@nestjs/swagger'


export class CourseDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
active: number  | null;
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
term: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
year: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
subjectId: number ;
}
