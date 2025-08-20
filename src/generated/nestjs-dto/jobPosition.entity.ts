
import {ApiProperty} from '@nestjs/swagger'
import {CompanyJobPosition} from './companyJobPosition.entity'
import {StudentInternship} from './studentInternship.entity'


export class JobPosition {
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
  type: () => CompanyJobPosition,
  isArray: true,
  required: false,
})
company_job_positions?: CompanyJobPosition[] ;
@ApiProperty({
  type: () => StudentInternship,
  isArray: true,
  required: false,
})
student_internships?: StudentInternship[] ;
}
