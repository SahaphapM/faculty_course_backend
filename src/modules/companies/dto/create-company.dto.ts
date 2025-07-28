import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Company Name' })
  name: string;

  @ApiProperty({ example: 'Thai description' })
  thaiDescription?: string;

  @ApiProperty({ example: 'English description' })
  engDescription?: string;

  @ApiProperty({ example: 'Company address' })
  address?: string;

  @ApiProperty({ example: 'Company telephone number' })
  tel?: string;

  @ApiProperty({ example: 'company@example.com' })
  email?: string;

  @ApiProperty({ example: 'https://company.com' })
  website?: string;
}