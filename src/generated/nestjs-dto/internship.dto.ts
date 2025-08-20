
import {ApiProperty} from '@nestjs/swagger'


export class InternshipDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
year: number  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
token: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
companyId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
curriculumId: number  | null;
}
