
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {SkillCollection} from './skillCollection.entity'
import {Branch} from './branch.entity'
import {User} from './user.entity'


export class Student {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
code: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
engName: string  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
  nullable: true,
})
enrollmentDate: Date  | null;
@ApiProperty({
  type: () => Object,
  nullable: true,
})
socials: Prisma.JsonValue  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
thaiName: string  | null;
@ApiProperty({
  type: () => SkillCollection,
  isArray: true,
  required: false,
})
skill_collections?: SkillCollection[] ;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
branchId: number  | null;
@ApiProperty({
  type: () => Branch,
  required: false,
  nullable: true,
})
branch?: Branch  | null;
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
}
