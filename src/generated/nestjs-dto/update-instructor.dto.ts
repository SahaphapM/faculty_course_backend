
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsOptional,IsString} from 'class-validator'




export class UpdateInstructorDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
branchId?: number  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
code?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
})
@IsOptional()
@IsString()
thaiName?: string ;
@ApiProperty({
  type: 'string',
  required: false,
})
@IsOptional()
@IsString()
engName?: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
tel?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
position?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
})
@IsOptional()
@IsString()
email?: string ;
}
