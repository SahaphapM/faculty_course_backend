import { IsOptional, IsString } from 'class-validator';

export class CreatePloDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  thaiDescription: string;

  @IsString()
  @IsOptional()
  engDescription: string;

  @IsString()
  type: string;

  @IsString()
  curriculumId: number;

  // @ApiProperty({ type: [String] })
  // @ApiHideProperty()
  // @IsString()
  // cloListId: string[];
}
