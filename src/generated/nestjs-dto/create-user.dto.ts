
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,IsOptional,IsString} from 'class-validator'




export class CreateUserDto {
  @ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
email: string ;
@ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
password: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
avatarUrl?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
role?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
hashedRefreshToken?: string  | null;
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
instructorId?: number  | null;
}
