
import {ApiProperty} from '@nestjs/swagger'
import {Instructor} from './instructor.entity'
import {Student} from './student.entity'
import {Coordinator} from './coordinator.entity'
import {AuditLog} from './auditLog.entity'


export class User {
  @ApiProperty({
  type: 'integer',
  format: 'int32',
})
id: number ;
@ApiProperty({
  type: 'string',
})
email: string ;
@ApiProperty({
  type: 'string',
})
password: string ;
@ApiProperty({
  type: 'string',
  nullable: true,
})
avatarUrl: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
role: string  | null;
@ApiProperty({
  type: 'string',
  nullable: true,
})
hashedRefreshToken: string  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
studentId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
instructorId: number  | null;
@ApiProperty({
  type: 'integer',
  format: 'int32',
  nullable: true,
})
coordinatorId: number  | null;
@ApiProperty({
  type: () => Instructor,
  required: false,
  nullable: true,
})
instructor?: Instructor  | null;
@ApiProperty({
  type: () => Student,
  required: false,
  nullable: true,
})
student?: Student  | null;
@ApiProperty({
  type: () => Coordinator,
  required: false,
  nullable: true,
})
coordinator?: Coordinator  | null;
@ApiProperty({
  type: () => AuditLog,
  isArray: true,
  required: false,
})
audit_logs?: AuditLog[] ;
}
