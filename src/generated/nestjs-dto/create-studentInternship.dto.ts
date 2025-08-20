
import {ApiProperty} from '@nestjs/swagger'
import {IsBoolean,IsInt,IsOptional} from 'class-validator'




export class CreateStudentInternshipDto {
  @ApiProperty({
  type: 'boolean',
  default: false,
  required: false,
})
@IsOptional()
@IsBoolean()
isAssessed?: boolean ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
studentId?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
jobPositionId?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
internshipId?: number  | null;
}
