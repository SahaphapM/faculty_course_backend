
import {ApiProperty} from '@nestjs/swagger'
import {IsInt,IsNotEmpty,IsOptional,IsString} from 'class-validator'




export class CreateSkillDto {
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
})
@IsNotEmpty()
@IsString()
thaiDescription: string ;
@ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
engDescription: string ;
@ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
domain: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
parentId?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
cloId?: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
@IsNotEmpty()
@IsInt()
curriculumId: number ;
}
