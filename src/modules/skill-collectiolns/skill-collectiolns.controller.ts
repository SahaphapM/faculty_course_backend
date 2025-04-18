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
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

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
    // ✅ รับค่าจาก Query Params
    return this.skillCollectionsService.getByCloId(courseId, cloId);
  }

  /////// import skill collections
  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  // Swagger API
  @ApiBody({ type: StudentScoreList, isArray: true })
  @Post('import')
  importSkill(
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('cloId', ParseIntPipe) cloId: number, // ✅ รับค่าจาก Query Params
    @Body() studentScoreList: StudentScoreList[], // ✅ ใช้ DTO
  ) {
    console.log('Import Path');
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
  getSkillCollectionByStudentId(@Query('studentCode') studentCode: string) {
    return this.skillCollectionsService.getSkillCollectionsByStudentId(
      studentCode,
    );
  }
}
