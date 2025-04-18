import { IsEmail, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class InstructorFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  thaiName?: string;

  @IsOptional()
  @IsString()
  engName?: string;

  @IsOptional()
  @IsString()
  curriculumCode?: string;

  @IsOptional()
  @IsString()
  branchThaiName?: string;

  @IsOptional()
  @IsString()
  branchEngName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
