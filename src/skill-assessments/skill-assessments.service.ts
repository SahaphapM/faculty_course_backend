import { Injectable } from '@nestjs/common';
import { CreateSkillAssessmentDto } from './dto/create-skill-assessment.dto';
import { UpdateSkillAssessmentDto } from './dto/update-skill-assessment.dto';

@Injectable()
export class SkillAssessmentsService {
  create(createSkillAssessmentDto: CreateSkillAssessmentDto) {
    return 'This action adds a new skillAssessment';
  }

  findAll() {
    return `This action returns all skillAssessments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} skillAssessment`;
  }

  update(id: number, updateSkillAssessmentDto: UpdateSkillAssessmentDto) {
    return `This action updates a #${id} skillAssessment`;
  }

  remove(id: number) {
    return `This action removes a #${id} skillAssessment`;
  }
}
