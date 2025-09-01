
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {IsBoolean,IsDateString,IsDecimal,IsInt,IsOptional,IsString} from 'class-validator'




export class UpdateCurriculumDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
branchId?: number ;
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
  nullable: true,
})
@IsOptional()
@IsString()
thaiName?: string  | null;
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
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
thaiDegree?: string  | null;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
engDegree?: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
})
@IsOptional()
@IsInt()
period?: number ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
  required: false,
})
@IsOptional()
@IsDecimal()
minimumGrade?: Prisma.Decimal ;
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
@ApiProperty({
  type: 'boolean',
  default: true,
  required: false,
})
@IsOptional()
@IsBoolean()
active?: boolean ;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  required: false,
  nullable: true,
})
@IsOptional()
@IsDateString()
archivedAt?: Date  | null;
}
