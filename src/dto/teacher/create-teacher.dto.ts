import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
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

  @IsString()
  officeRoom: string;

  @IsArray()
  specialists: string[];

  @IsOptional()
  socials: Partial<SocialForm>;

  @IsString()
  branchId: string;

  @IsArray()
  curriculumsId: string[];

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
