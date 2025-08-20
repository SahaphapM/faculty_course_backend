
import {ApiProperty} from '@nestjs/swagger'


export class CoordinatorDto {
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
  type: 'integer',
  format: 'int32',
  nullable: true,
})
userId: number  | null;
}
