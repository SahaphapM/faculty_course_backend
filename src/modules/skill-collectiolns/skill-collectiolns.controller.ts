import {
  Controller,
  Post,
  Body,
  Query,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { SkillCollectiolnsService } from './skill-collectiolns.service';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { SkillCollection } from 'src/generated/nestjs-dto/skillCollection.entity';
import { StudentScoreList } from 'src/dto/filter-params.dto';

@Controller('skill-collectiolns')
export class SkillCollectiolnsController {
  constructor(
    private readonly skillCollectiolnsService: SkillCollectiolnsService,
  ) {}

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get()
  getSkillCollectionByCloId(
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('cloId', ParseIntPipe) cloId: number,
  ): Promise<Partial<SkillCollection>[]> {
    // ✅ รับค่าจาก Query Params
    return this.skillCollectiolnsService.getByCloId(courseId, cloId);
  }

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

  @Roles(
    UserRole.Admin,
    UserRole.Coordinator,
    UserRole.Instructor,
    UserRole.Student,
  )
  @Get('student')
  getSkillCollectionByStudentId(@Query('studentCode') studentCode: string) {
    return this.skillCollectiolnsService.getSkillCollectionsByStudentId(
      studentCode,
    );
  }
}
