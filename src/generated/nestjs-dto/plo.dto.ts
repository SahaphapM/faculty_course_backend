
import {ApiProperty} from '@nestjs/swagger'


export class PloDto {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
curriculumId: number ;
@ApiProperty({
  type: 'string',
})
type: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
name: string  | null;
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
}
