import {
  Controller,
  Post,
  Body,
  Query,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { SkillCollectionsService } from './skill-collectiolns.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { SkillCollection } from 'src/generated/nestjs-dto/skillCollection.entity';
import { StudentScoreList } from 'src/dto/filters/filter.base.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('skill-collections')
export class SkillCollectionsController {
  constructor(
    private readonly skillCollectionsService: SkillCollectionsService,
  ) {}

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get()
  getSkillCollectionByCloId(
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('cloId', ParseIntPipe) cloId: number,
  ): Promise<Partial<SkillCollection>[]> {
    return this.skillCollectionsService.getByCloId(courseId, cloId);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @ApiBody({ type: StudentScoreList, isArray: true })
  @Post('import')
  importSkill(
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('cloId', ParseIntPipe) cloId: number, // ✅ รับค่าจาก Query Params
    @Body() studentScoreList: StudentScoreList[], // ✅ ใช้ DTO
  ) {
    return this.skillCollectionsService.importSkillCollections(
      courseId,
      cloId,
      studentScoreList,
    );
  }

  @Roles(
    UserRole.Admin,
    UserRole.Coordinator,
    UserRole.Instructor,
    UserRole.Student,
  )
  @Get('student')
  getTranscriptFromAssessment(@Query('studentCode') studentCode: string) {
    return this.skillCollectionsService.getTranscriptFromAssessment(
      studentCode,
    );
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post('generate-test-data')
  @ApiOperation({
    summary: 'Generate comprehensive test data for curriculum',
    description: `
    Generates realistic test data including:
    - New curriculum with branchId = 2
    - 3 coordinators with realistic profiles
    - 100 students with Thai/English names
    - PLOs (Program Learning Outcomes)
    - 3-level skills hierarchy (root → level 2 → level 3)
    - 5 subjects/courses
    - CLOs (Course Learning Outcomes)
    - Student skill collections linking students to skills

    This endpoint creates a complete educational data structure for testing purposes.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Test data generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            curriculum: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                code: { type: 'string' },
                thaiName: { type: 'string' },
                engName: { type: 'string' },
              },
            },
            summary: {
              type: 'object',
              properties: {
                coordinatorsCount: { type: 'number' },
                studentsCount: { type: 'number' },
                plosCount: { type: 'number' },
                skillsCount: { type: 'number' },
                subjectsCount: { type: 'number' },
                coursesCount: { type: 'number' },
                closCount: { type: 'number' },
                skillCollectionsCount: { type: 'number' },
              },
            },
            skillHierarchy: {
              type: 'object',
              properties: {
                rootSkills: { type: 'number' },
                level2Skills: { type: 'number' },
                level3Skills: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  generateTestData() {
    return this.skillCollectionsService.generateTestData();
  }
}
