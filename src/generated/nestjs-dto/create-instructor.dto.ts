
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,IsOptional,IsString} from 'class-validator'




export class CreateInstructorDto {
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
})
@IsNotEmpty()
@IsString()
thaiName: string ;
@ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
engName: string ;
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
picture?: string  | null;
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
})
@IsNotEmpty()
@IsString()
email: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
officeRoom?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
specialists?: string  | null;
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
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
bio?: string  | null;
}
