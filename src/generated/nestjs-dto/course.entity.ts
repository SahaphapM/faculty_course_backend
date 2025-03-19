
import {ApiProperty} from '@nestjs/swagger'
import {Subject} from './subject.entity'
import {CourseInstructor} from './courseInstructor.entity'
import {SkillCollection} from './skillCollection.entity'


export class Course {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
active: number  | null;
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
term: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
year: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
})
subjectId: number ;
@ApiProperty({
  type: () => Subject,
  required: false,
})
subject?: Subject ;
@ApiProperty({
  type: () => CourseInstructor,
  isArray: true,
  required: false,
})
course_instructors?: CourseInstructor[] ;
@ApiProperty({
  type: () => SkillCollection,
  isArray: true,
  required: false,
})
skill_collections?: SkillCollection[] ;
}
