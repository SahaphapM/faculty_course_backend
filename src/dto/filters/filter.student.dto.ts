import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class StudentFilterDto extends BaseFilterParams {
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
  branchThaiName?: string;

  @IsOptional()
  @IsString()
  branchEngName?: string;

  @IsOptional()
  @IsString()
  facultyThaiName?: string;

  @IsOptional()
  @IsString()
  facultyEngName?: string;

  @IsOptional()
  @IsString()
  skill_collection?: boolean;

  @IsOptional()
  @IsString()
  skill_collection_name?: string;
}
