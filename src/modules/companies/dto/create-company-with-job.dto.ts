import { IsArray } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCompanyDto } from 'src/generated/nestjs-dto/create-company.dto';
import { ConnectJobPositionDto } from 'src/generated/nestjs-dto/connect-jobPosition.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyWithJobPositionsDto extends CreateCompanyDto {
  @IsArray()
  @Type(() => ConnectJobPositionDto)
  @ValidateNested({ each: true })
  @ApiProperty({ type: () => ConnectJobPositionDto, isArray: true })
  jobPositions: ConnectJobPositionDto[];
}
