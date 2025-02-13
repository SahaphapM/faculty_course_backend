import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInstructorDto {
  @IsEmail()
  email: string;

  @IsString()
  thaiName: string;

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

  @IsNumber()
  @IsOptional()
  branchId: number;

  @IsOptional()
  @IsArray()
  @IsNumber({ allowNaN: false }, { each: true })
  curriculumsId: [];

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
  x: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}
