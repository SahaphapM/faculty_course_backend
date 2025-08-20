
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsOptional,IsString} from 'class-validator'




export class UpdateCoordinatorDto {
  @ApiProperty({
  type: 'string',
  default: '',
  required: false,
})
@IsOptional()
@IsString()
thaiName?: string ;
@ApiProperty({
  type: 'string',
  default: '',
  required: false,
})
@IsOptional()
@IsString()
engName?: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
userId?: number  | null;
}
