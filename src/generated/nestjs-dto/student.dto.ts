
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class StudentDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
enrollmentDate: Date  | null;
@ApiProperty({
  type: () => Object,
  nullable: true,
})
socials: Prisma.JsonValue  | null;
@ApiProperty({
  type: 'string',
})
code: string ;
@ApiProperty({
  type: 'string',
})
thaiName: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
branchId: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
userId: number  | null;
}
