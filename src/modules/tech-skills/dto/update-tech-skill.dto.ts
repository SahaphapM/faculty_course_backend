import { PartialType } from '@nestjs/swagger';
import { CreateTechSkillDto } from './create-tech-skill.dto';

export class UpdateTechSkillDto extends PartialType(CreateTechSkillDto) {}
