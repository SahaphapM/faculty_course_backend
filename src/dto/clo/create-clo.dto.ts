import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCloDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty()
  @IsNotEmpty()
  ploId: string;
}
