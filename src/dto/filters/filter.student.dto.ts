import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class StudentFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  nameCode?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsString()
  facultyName?: string;

  @IsOptional()
  @IsString()
  skillName?: string;
}
