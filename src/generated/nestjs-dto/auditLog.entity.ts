
import {Prisma} from '@prisma/client'
import {ApiProperty} from '@nestjs/swagger'
import {User} from './user.entity'


export class AuditLog {
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
userId: number  | null;
@ApiProperty({
  type: () => User,
  required: false,
  nullable: true,
})
user?: User  | null;
@ApiProperty({
  type: 'string',
})
action: string ;
@ApiProperty({
  type: 'string',
})
resource: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
resourceId: string  | null;
@ApiProperty({
  type: () => Object,
  nullable: true,
})
before: Prisma.JsonValue  | null;
@ApiProperty({
  type: () => Object,
  nullable: true,
})
after: Prisma.JsonValue  | null;
@ApiProperty({
  type: () => Object,
  nullable: true,
})
diff: Prisma.JsonValue  | null;
@ApiProperty({
  type: () => Object,
  nullable: true,
})
metadata: Prisma.JsonValue  | null;
@ApiProperty({
  type: 'string',
  format: 'date-time',
})
timestamp: Date ;
}
