
import {ApiProperty} from '@nestjs/swagger'


export class StudentDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
code: string ;
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
  type: 'string',
  format: 'date-time',
  nullable: true,
})
graduationDate: Date  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiName: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
curriculumId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
branchId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
userId: number  | null;
}
