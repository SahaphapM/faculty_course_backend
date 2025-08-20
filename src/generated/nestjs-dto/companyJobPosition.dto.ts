
import {ApiProperty} from '@nestjs/swagger'


export class CompanyJobPositionDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
}
