
import {ApiExtraModels,ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,IsOptional,IsString,ValidateNested} from 'class-validator'
import {Type} from 'class-transformer'

export class UserInstructorIdStudentIdCoordinatorIdUniqueInputDto {
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
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
coordinatorId: number ;
  }

@ApiExtraModels(UserInstructorIdStudentIdCoordinatorIdUniqueInputDto)
export class ConnectUserDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
id?: number ;
@ApiProperty({
  type: 'string',
  required: false,
})
@IsOptional()
@IsString()
email?: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
studentId?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
instructorId?: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
coordinatorId?: number ;
@ApiProperty({
  type: UserInstructorIdStudentIdCoordinatorIdUniqueInputDto,
  required: false,
})
@IsOptional()
@ValidateNested()
@Type(() => UserInstructorIdStudentIdCoordinatorIdUniqueInputDto)
instructorId_studentId_coordinatorId?: UserInstructorIdStudentIdCoordinatorIdUniqueInputDto ;
}
