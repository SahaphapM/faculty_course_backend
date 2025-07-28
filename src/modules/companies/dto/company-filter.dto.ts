import { IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';

export class CompanyFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;
}