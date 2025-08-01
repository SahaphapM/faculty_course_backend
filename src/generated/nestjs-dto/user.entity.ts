import { ApiProperty } from '@nestjs/swagger';
import { Student } from './student.entity';
import { Instructor } from './instructor.entity';
import { Exclude } from 'class-transformer';

export class User {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  id: number;
  @ApiProperty({
    type: 'string',
  })
  email: string;
  @ApiProperty({
    type: 'string',
  })
  @Exclude()
  password: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  avatarUrl: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  role: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  hashedRefreshToken: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  studentId: number | null;
  @ApiProperty({
    type: () => Student,
    required: false,
    nullable: true,
  })
  student?: Student | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  instructorId: number | null;
  @ApiProperty({
    type: () => Instructor,
    required: false,
    nullable: true,
  })
  instructor?: Instructor | null;
}
