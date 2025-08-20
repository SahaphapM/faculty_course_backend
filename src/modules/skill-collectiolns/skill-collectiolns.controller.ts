import {
  Controller,
  Post,
  Body,
  Query,
  ParseIntPipe,
  Get,
  Param,
} from '@nestjs/common';
import { SkillCollectionsService } from './skill-collectiolns.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiQuery,
  ApiResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  SkillCollectionByCourseFilterDto,
  SkillCollectionFilterDto,
} from 'src/dto/filters/filter.skill-collection.dto';
import { PaginatedSkillCollectionDto } from 'src/dto/pagination.types';
import { StudentScoreList } from 'src/dto/student-score.dto';
import { SkillImportService } from './skill-import.service';

@ApiBearerAuth()
@Controller('skill-collections')
export class SkillCollectionsController {
  constructor(
    private readonly skillCollectionsService: SkillCollectionsService,
    private readonly skillImportService: SkillImportService,
  ) {}

  @ApiOperation({
    summary: 'Get skill collections by course and clo (paginated)',
  })
  @ApiExtraModels(SkillCollectionFilterDto, PaginatedSkillCollectionDto)
  @ApiQuery({
    name: 'query',
    required: true,
    schema: { $ref: getSchemaPath(SkillCollectionFilterDto) },
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated skill collections',
    type: PaginatedSkillCollectionDto,
  })
  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get()
  getSkillCollectionByCloId(@Query() query: SkillCollectionFilterDto) {
    return this.skillCollectionsService.getByCourseAndCloId(query);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @ApiBody({ type: StudentScoreList, isArray: true })
  @Post('import')
  importSkill(
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('cloId', ParseIntPipe) cloId: number, // ✅ รับค่าจาก Query Params
    @Body() studentScoreList: StudentScoreList[], // ✅ ใช้ DTO
  ) {
    return this.skillImportService.importSkillCollections(
      courseId,
      cloId,
      studentScoreList,
      {
        enabled: true,
        maxStudents: 2,
        includeNames: true,
      },
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

  // GET /skill-collections/course/:id
  @Get('course/:id')
  async getSkillCollectionSummaryByCoursePaginated(
    @Param('id', ParseIntPipe) courseId: number,
    @Query() pag: SkillCollectionByCourseFilterDto,
  ) {
    return this.skillCollectionsService.getSkillCollectionSummaryByCoursePaginated(
      courseId,
      pag,
    );
  }
}
