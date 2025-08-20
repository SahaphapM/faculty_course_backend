
import {ApiProperty} from '@nestjs/swagger'
import {Company} from './company.entity'
import {StudentInternship} from './studentInternship.entity'
import {Curriculum} from './curriculum.entity'


export class Internship {
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
@ApiProperty({
  type: () => Company,
  required: false,
  nullable: true,
})
company?: Company  | null;
@ApiProperty({
  type: () => StudentInternship,
  isArray: true,
  required: false,
})
studentInternships?: StudentInternship[] ;
@ApiProperty({
  type: () => Curriculum,
  required: false,
  nullable: true,
})
curriculum?: Curriculum  | null;
}
