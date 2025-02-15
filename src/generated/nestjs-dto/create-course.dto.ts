
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,IsOptional,IsString} from 'class-validator'




export class CreateCourseDto {
  @ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
name: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  default: 1,
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
active?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
subjectId?: number  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
thaiDescription?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
engDescription?: string  | null;
}
