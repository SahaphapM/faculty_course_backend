
import {ApiProperty} from '@nestjs/swagger'
import {CompanyJobPosition} from './companyJobPosition.entity'
import {Internship} from './internship.entity'


export class Company {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
name: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
description: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
address: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
tel: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
email: string  | null;
@ApiProperty({
  type: () => CompanyJobPosition,
  isArray: true,
  required: false,
})
company_job_positions?: CompanyJobPosition[] ;
@ApiProperty({
  type: () => Internship,
  isArray: true,
  required: false,
})
internships?: Internship[] ;
}
