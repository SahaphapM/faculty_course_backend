import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { SkillAssessmentsService } from './skill-assessments.service';
import { UpdateSkillAssessmentDto } from 'src/generated/nestjs-dto/update-skillAssessment.dto';
import { ApiParam, ApiOperation } from '@nestjs/swagger';

@Controller('skill-assessments')
export class SkillAssessmentsController {
  constructor(
    private readonly skillAssessmentsService: SkillAssessmentsService,
  ) {}

  @Get('student/:studentId')
  @ApiParam({ name: 'studentId', type: String, description: 'Student Code' })
  getStudentSkillAssessments(@Param('studentId') studentId: number) {
    return this.skillAssessmentsService.getStudentSkillAssessments(studentId);
  }

  @Patch('company/:skillAssessmentId/:studentInternshipId')
  @ApiOperation({
    summary:
      'สถานประกอบประเมิน  Assessment 1 Skill ของนิสิตคนนั้นๆ | ใส่ได้แค่ companyLevel และ companyComment',
  })
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

  @Patch('company-submit/:studentInternshipId')
  @ApiOperation({
    summary:
      'สถานประกอบยืนยันการประเมินนิสิต และจะประเมินซ้ำไม่ได้ | ไม่ต้องส่ง body',
  })
  companySubmitAssessment(
    @Param('studentInternshipId') studentInternshipId: string,
  ) {
    return this.skillAssessmentsService.companySubmitAssessment(
      +studentInternshipId,
    );
  }

  @Patch('curriculum/:skillAssessmentId')
  @ApiOperation({
    summary:
      'หลักสูตรประเมิน Final Assessment 1 Skill ของนิสิตคนนั้นๆ | ใส่ได้แค่ finalLevel และ curriculumComment',
  })
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
