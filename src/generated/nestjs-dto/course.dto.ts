
import {ApiProperty} from '@nestjs/swagger'


export class CourseDto {
  @ApiProperty({
  type: 'string',
})
name: string ;
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
subjectId: number  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiDescription: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engDescription: string  | null;
}
