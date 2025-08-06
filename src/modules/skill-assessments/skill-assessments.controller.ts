import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { SkillAssessmentsService } from './skill-assessments.service';
import { UpdateSkillAssessmentDto } from 'src/generated/nestjs-dto/update-skillAssessment.dto';
import { ApiParam, ApiOperation } from '@nestjs/swagger';

@Controller('skill-assessments')
export class SkillAssessmentsController {
  constructor(
    private readonly skillAssessmentsService: SkillAssessmentsService,
  ) { }

  @Get('student/:studentId')
  @ApiParam({ name: 'studentId', type: String, description: 'Student Code' })
  getStudentSkillAssessments(@Param('studentId') studentId: number) {
    return this.skillAssessmentsService.getStudentSkillAssessments(studentId);
  }

  // change param name to easy to understand

  @Get(':internshipId/:studentCode')
  // set name for this api swagger
  @ApiOperation({
    summary: 'สถานประกอบการใช้ในการดึง Skill Assessment ของนิสิตคนนั้นๆ',
  })
  @ApiParam({
    name: 'internshipId',
    type: String,
    description: 'Internship Id',
  })
  @ApiParam({ name: 'studentCode', type: String, description: 'Student Code' })
  getStudentAssessment(
    @Param('internshipId') internshipId: string,
    @Param('studentCode') studentCode: string,
  ) {
    return this.skillAssessmentsService.getAssessmentByStudent(
      +internshipId,
      studentCode,
    );
  }

  @Patch(':skillAssessmentId/:studentInternshipId')
  // set name for this api swagger
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

  @Patch('submit/:studentInternshipId')
  // set name for this api swagger
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
  // set name for this api swagger
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
