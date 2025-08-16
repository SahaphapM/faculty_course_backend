import { ApiProperty } from '@nestjs/swagger';

export class InstructorIds {
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  instructorIds: number[];
}
