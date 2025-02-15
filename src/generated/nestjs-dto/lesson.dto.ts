
import {ApiProperty} from '@nestjs/swagger'


export class LessonDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
subjectId: number ;
}
