
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {IsDateString,IsInt,IsNotEmpty,IsOptional,IsString} from 'class-validator'




export class CreateAuditLogDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  required: false,
  nullable: true,
})
@IsOptional()
@IsInt()
userId?: number  | null;
@ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
action: string ;
@ApiProperty({
  type: 'string',
})
@IsNotEmpty()
@IsString()
resource: string ;
@ApiProperty({
  type: 'string',
  required: false,
  nullable: true,
})
@IsOptional()
@IsString()
resourceId?: string  | null;
@ApiProperty({
  type: () => Object,
  required: false,
  nullable: true,
})
@IsOptional()
before?: Prisma.InputJsonValue  | Prisma.NullableJsonNullValueInput;
@ApiProperty({
  type: () => Object,
  required: false,
  nullable: true,
})
@IsOptional()
after?: Prisma.InputJsonValue  | Prisma.NullableJsonNullValueInput;
@ApiProperty({
  type: () => Object,
  required: false,
  nullable: true,
})
@IsOptional()
diff?: Prisma.InputJsonValue  | Prisma.NullableJsonNullValueInput;
@ApiProperty({
  type: () => Object,
  required: false,
  nullable: true,
})
@IsOptional()
metadata?: Prisma.InputJsonValue  | Prisma.NullableJsonNullValueInput;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  default: new Date().toISOString(),
  required: false,
})
@IsOptional()
@IsDateString()
timestamp?: Date ;
}
