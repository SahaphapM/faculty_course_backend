
import {ApiProperty} from '@nestjs/swagger'


export class StudentInternshipDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'boolean',
})
isAssessed: boolean ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
studentId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
jobPositionId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
internshipId: number  | null;
}
