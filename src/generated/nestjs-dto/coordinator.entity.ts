
import {ApiProperty} from '@nestjs/swagger'
import {User} from './user.entity'
import {CurriculumCoordinators} from './curriculumCoordinators.entity'


export class Coordinator {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
thaiName: string ;
@ApiProperty({
  type: 'string',
})
engName: string ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
userId: number  | null;
@ApiProperty({
  type: () => User,
  required: false,
  nullable: true,
})
user?: User  | null;
@ApiProperty({
  type: () => CurriculumCoordinators,
  isArray: true,
  required: false,
})
curriculums?: CurriculumCoordinators[] ;
}
