import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePloDto {
  @IsString()
  num_plo: string;

  @IsString()
  description: string;

  @IsString()
  resultTypes: string;

  @IsString()
  curriculumId: string;

  @ApiProperty({ type: [String] })
  @IsString()
  cloListId: string[];
}
