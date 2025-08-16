import { ApiProperty } from '@nestjs/swagger';

export class CoordinatorIds {
  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  coordinatorIds: number[];
}
