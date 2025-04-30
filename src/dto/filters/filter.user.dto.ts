import { IsEmail, IsOptional, IsString } from 'class-validator';
import { BaseFilterParams } from './filter.base.dto';

export class UserFilterDto extends BaseFilterParams {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
