import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class BranchFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  thaiName?: string;

  @IsOptional()
  @IsString()
  engName?: string;
}
