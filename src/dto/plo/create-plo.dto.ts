import { IsOptional, IsString } from 'class-validator';

export class CreatePloDto {
  @IsString()
  thaiDescription: string;

  @IsString()
  @IsOptional()
  engDescription: string;

  @IsString()
  type: string;

  @IsString()
  curriculumCode: string;

  // @ApiProperty({ type: [String] })
  // @ApiHideProperty()
  // @IsString()
  // cloListId: string[];
}
