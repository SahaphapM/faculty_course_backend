import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Curriculum } from 'src/entities/curriculum.entity';
import { LearningDomain } from 'src/enums/learning-domain.enum';

export class CreateSkillDto {
  @IsOptional()
  @IsString()
  thaiName?: string;

  @IsOptional()
  @IsString()
  engName?: string;

  @IsOptional()
  @IsString()
  thaiDescription?: string;

  @IsOptional()
  @IsString()
  engDescription?: string;

  @IsOptional()
  @IsEnum(LearningDomain)
  domain?: LearningDomain;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSkillDto) // Recursive type for nested skills
  children?: CreateSkillDto[];

  @IsOptional()
  parent?: number; // Reference to parent skill ID

  curriculum: Partial<Curriculum>; //Ref to curriculum ID
}
