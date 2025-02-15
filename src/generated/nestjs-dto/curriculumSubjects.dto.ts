
import {ApiProperty} from '@nestjs/swagger'


export class CurriculumSubjectsDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
subjectId: number ;
}
