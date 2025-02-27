
import {ApiProperty} from '@nestjs/swagger'


export class CurriculumCoordinatorsDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
instructorId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
curriculumId: number ;
}
