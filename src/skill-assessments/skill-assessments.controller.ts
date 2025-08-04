import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SkillAssessmentsService } from './skill-assessments.service';
import { CreateSkillAssessmentDto } from './dto/create-skill-assessment.dto';
import { UpdateSkillAssessmentDto } from './dto/update-skill-assessment.dto';

@Controller('skill-assessments')
export class SkillAssessmentsController {
  constructor(private readonly skillAssessmentsService: SkillAssessmentsService) {}

  @Post()
  create(@Body() createSkillAssessmentDto: CreateSkillAssessmentDto) {
    return this.skillAssessmentsService.create(createSkillAssessmentDto);
  }

  @Get()
  findAll() {
    return this.skillAssessmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillAssessmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillAssessmentDto: UpdateSkillAssessmentDto) {
    return this.skillAssessmentsService.update(+id, updateSkillAssessmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillAssessmentsService.remove(+id);
  }
}
