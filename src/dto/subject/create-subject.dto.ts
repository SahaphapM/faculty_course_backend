import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { Curriculum } from 'src/entities/curriculum.entity';
import { SubjectType } from 'src/enums/subject-types.enum';

export class CreateSubjectDto {
  @IsString()
  code: string;

  @IsString()
  thaiName: string;

  @IsString()
  engName: string;

  @IsString()
  thaiDescription: string;

  @IsString()
  engDescription: string;

  @IsString()
  credit: string;

  @IsEnum(SubjectType)
  type: SubjectType;

  @IsOptional()
  @IsArray()
  curriculums?: Curriculum[];

  // @IsOptional()
  // @IsNumber({ allowNaN: false }, { each: true })
  // skillListId: number[];
}
