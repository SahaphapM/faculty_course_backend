
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {IsDateString,IsInt,IsOptional,IsString} from 'class-validator'




export class UpdateStudentDto {
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
  type: () => Object,
  required: false,
  nullable: true,
})
@IsOptional()
socials?: Prisma.InputJsonValue  | Prisma.NullableJsonNullValueInput;
@ApiProperty({
  type: 'string',
  required: false,
})
@IsOptional()
@IsString()
code?: string ;
@ApiProperty({
  type: 'string',
  required: false,
})
@IsOptional()
@IsString()
thaiName?: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
branchId?: number ;
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
