import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInstructorDto {
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
  @IsString({ each: true })
  specialists: string[];

  @IsOptional()
  socials: Partial<SocialForm>;

  @IsOptional()
  @IsString()
  branchId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  curriculumsId: string[];

  @IsOptional()
  @IsString()
  userId: string;
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
