
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,IsOptional,IsString,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class UserInstructorIdStudentIdUniqueInputDto {
    @ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
instructorId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
studentId: number ;
  }

@ApiExtraModels(UserInstructorIdStudentIdUniqueInputDto)
export class ConnectUserDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
id?: number ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
email?: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
studentId?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
instructorId?: number ;
@ApiProperty({
  type: UserInstructorIdStudentIdUniqueInputDto,
  required: false,
  nullable: true,
})
@IsOptional()
@ValidateNested()
@Type(() => UserInstructorIdStudentIdUniqueInputDto)
instructorId_studentId?: UserInstructorIdStudentIdUniqueInputDto ;
}
