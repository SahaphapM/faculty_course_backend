
import {ApiProperty} from '@nestjs/swagger'


export class BranchDto {
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
facultyId: number  | null;
@ApiProperty({
  type: 'string',
})
thaiDescription: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engDescription: string  | null;
@ApiProperty({
  type: 'string',
})
thaiName: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
abbrev: string  | null;
}
