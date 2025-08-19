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
import { SkillCollection } from 'src/generated/nestjs-dto/skillCollection.entity';
import {
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SkillCollectionByCourseFilterDto } from 'src/dto/filters/filter.skill-collection-summary.dto';
import { StudentScoreList } from 'src/dto/student-score.dto';

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
