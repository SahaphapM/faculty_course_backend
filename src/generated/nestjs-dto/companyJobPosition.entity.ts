
import {ApiProperty} from '@nestjs/swagger'
import {Company} from './company.entity'
import {JobPosition} from './jobPosition.entity'


export class CompanyJobPosition {
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
companyId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
jobPositionId: number  | null;
@ApiProperty({
  type: () => Company,
  required: false,
  nullable: true,
})
company?: Company  | null;
@ApiProperty({
  type: () => JobPosition,
  required: false,
  nullable: true,
})
jobPosition?: JobPosition  | null;
}
