import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePloDto {
  @IsString()
  thaiDescription: string;

  @IsString()
  @IsOptional()
  engDescription: string;

  @IsString()
  type: string;

  @IsNumber()
  curriculumId: number;

  // @ApiProperty({ type: [String] })
  // @ApiHideProperty()
  // @IsString()
  // cloListId: string[];
}
