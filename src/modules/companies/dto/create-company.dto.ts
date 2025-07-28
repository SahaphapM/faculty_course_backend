import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Company Name',
    description: 'The name of the company',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  name: string;

  @ApiProperty({
    example: 'Thai description',
    description: 'Company description in Thai',
    required: false
  })
  @IsOptional()
  @IsString()
  thaiDescription?: string;

  @ApiProperty({
    example: 'English description',
    description: 'Company description in English',
    required: false
  })
  @IsOptional()
  @IsString()
  engDescription?: string;

  @ApiProperty({
    example: 'Company address',
    description: 'Physical address of the company',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'Company telephone number',
    description: 'Contact telephone number',
    required: false
  })
  @IsOptional()
  @IsString()
  tel?: string;

  @ApiProperty({
    example: 'company@example.com',
    description: 'Contact email address',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    example: 'https://company.com',
    description: 'Company website URL',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid website URL' })
  website?: string;
}