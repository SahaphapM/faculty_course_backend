import { PartialType } from '@nestjs/swagger';
import { CreateSkillAssessmentDto } from './create-skill-assessment.dto';

export class UpdateSkillAssessmentDto extends PartialType(CreateSkillAssessmentDto) {}
