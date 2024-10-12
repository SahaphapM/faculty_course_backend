import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTeacherDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  engName: string;

  @IsOptional()
  @IsString()
  tel: string;

  @IsOptional()
  @IsString()
  picture: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  officeRoom: string;

  @IsOptional()
  @IsArray()
  specialists: string[];

  @IsOptional()
  socials: Partial<SocialForm>;

  @IsOptional()
  @IsString()
  branchId: string;

  @IsOptional()
  @IsArray()
  curriculumsId: string[];

  @IsOptional()
  @IsNumber()
  userId: number;
}

interface SocialForm {
  line: string;
  facebook: string;
  linkedin: string;
  github: string;
  gitlab: string;
  website: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}
