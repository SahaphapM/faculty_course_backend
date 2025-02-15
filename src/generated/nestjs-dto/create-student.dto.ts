
import {ApiProperty} from '@nestjs/swagger'
import {IsDateString,IsNotEmpty,IsOptional,IsString} from 'class-validator'




export class CreateStudentDto {
  @ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
engName?: string  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  required: false,
  nullable: true,
})
@IsOptional()
@IsDateString()
enrollmentDate?: Date  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
socials?: string  | null;
@ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
code: string ;
@ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
thaiName: string ;
}
