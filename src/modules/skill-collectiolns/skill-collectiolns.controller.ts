import { Controller, Post, Body, Query, ParseIntPipe } from '@nestjs/common';
import { SkillCollectiolnsService } from './skill-collectiolns.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { StudentScoreList } from 'src/dto/filter-params.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('skill-collectiolns')
export class SkillCollectiolnsController {
  constructor(
    private readonly skillCollectiolnsService: SkillCollectiolnsService,
  ) {}

  /////// import skill collections

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Post('import')
  importSkill(
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('cloId', ParseIntPipe) cloId: number, // ✅ รับค่าจาก Query Params
    @Body() studentScoreList: StudentScoreList[], // ✅ ใช้ DTO
  ) {
    console.log('Import Path');
    return this.skillCollectiolnsService.importSkillCollections(
      courseId,
      cloId,
      studentScoreList,
    );
  }
}
