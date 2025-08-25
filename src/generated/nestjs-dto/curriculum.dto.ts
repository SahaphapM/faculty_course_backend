
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'


export class CurriculumDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
branchId: number ;
@ApiProperty({
  type: 'string',
})
code: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiDegree: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engDegree: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
period: number ;
@ApiProperty({
  type: 'string',
  format: 'Decimal.js',
})
minimumGrade: Prisma.Decimal ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiDescription: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engDescription: string  | null;
@ApiProperty({
  type: 'boolean',
})
active: boolean ;
}
