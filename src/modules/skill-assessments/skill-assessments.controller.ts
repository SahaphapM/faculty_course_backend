import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { SkillAssessmentsService } from './skill-assessments.service';
import { UpdateSkillAssessmentDto } from 'src/generated/nestjs-dto/update-skillAssessment.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('skill-assessments')
export class SkillAssessmentsController {
  constructor(
    private readonly skillAssessmentsService: SkillAssessmentsService,
  ) { }

  @Get('student/:studentCode')
  @ApiParam({ name: 'studentCode', type: String, description: 'Student Code' })
  getStudentSkillAssessments(@Param('studentCode') studentCode: string) {
    return this.skillAssessmentsService.getStudentSkillAssessments(studentCode);
  }

  @Get(':id/students/:studentCode/assessment')
  @ApiParam({ name: 'studentCode', type: String, description: 'Student Code' })
  getStudentAssessment(
    @Param('id') id: string,
    @Param('studentCode') studentCode: string,
  ) {
    return this.skillAssessmentsService.getAssessmentByStudent(
      +id,
      studentCode,
    );
  }

  @Patch('skill-assessments/:skillAssessmentId/:studentInternshipId')
  updateSkillAssessment(
    @Param('skillAssessmentId') skillAssessmentId: string,
    @Param('studentInternshipId') studentInternshipId: string,
    @Body() updateSkillAssessmentDto: UpdateSkillAssessmentDto,
  ) {
    return this.skillAssessmentsService.companyAssessment(
      +skillAssessmentId,
      +studentInternshipId,
      updateSkillAssessmentDto,
    );
  }

  @Patch('company-submit-assessment/:studentInternshipId')
  companySubmitAssessment(
    @Param('studentInternshipId') studentInternshipId: string,
  ) {
    return this.skillAssessmentsService.companySubmitAssessment(
      +studentInternshipId,
    );
  }

  @Patch('curriculum-final-assessment/:skillAssessmentId')
  curriculumFinalAssessment(
    @Param('skillAssessmentId') skillAssessmentId: string,
    @Body() updateSkillAssessmentDto: UpdateSkillAssessmentDto,
  ) {
    return this.skillAssessmentsService.curriculumFinalAssessment(
      +skillAssessmentId,
      updateSkillAssessmentDto,
    );
  }
}
