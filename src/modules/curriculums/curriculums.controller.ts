import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateCurriculumDto } from 'src/generated/nestjs-dto/create-curriculum.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { CurriculumFilterDto } from 'src/dto/filters/filter.curriculum.dto';

@ApiBearerAuth()
@Controller('curriculums')
export class CurriculumsController {
  constructor(private readonly curriculumsService: CurriculumsService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  create(@Body() createCurriculumDto: CreateCurriculumDto) {
    return this.curriculumsService.create(createCurriculumDto);
  }

  @Get()
  findAll(@Query() pag?: CurriculumFilterDto) {
    return this.curriculumsService.findAll(pag);
  }

  @Get('summary:curriculumId')
  async getSkillSummaryByCurriculum(
    @Param('curriculumId') curriculumId: number,
    @Query('yearCode') yearCode: string,
    @Query('skillType') skillType: string,
  ) {
    return this.curriculumsService.getSkillSummaryByCurriculum(
      curriculumId,
      yearCode,
      skillType,
    );
  }

  @Get(':code')
  findOneByCode(@Param('code') code: string) {
    return this.curriculumsService.findOneByCode(code);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ) {
    return this.curriculumsService.update(+id, updateCurriculumDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curriculumsService.remove(+id);
  }

  @Get('filters/:branchId')
  @ApiParam({ name: 'branchId', type: String, description: 'Branch ID' })
  async filters(@Param('branchId') branchId: string) {
    return this.curriculumsService.findWithFilters(+branchId);
  }

  @ApiQuery({
    name: 'yearCode',
    required: false,
    description: 'Optional year code filter',
  })
  @ApiQuery({
    name: 'targetLevel',
    required: true,
    description: 'Required level filter',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Optional page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Optional limit per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Optional search query',
  })
  @Get('filters/skill/:skillId/students')
  @ApiParam({ name: 'skillId', type: String, description: 'Skill ID' })
  async getStudentsBySkillLevel(
    @Param('skillId') skillId: number,
    @Query('targetLevel') targetLevel: 'on' | 'above' | 'below' | 'all',
    @Query('yearCode') yearCode: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string, // optional
  ) {
    return await this.curriculumsService.findStudentsBySkillLevel(
      skillId,
      targetLevel,
      yearCode,
      page,
      limit,
      search,
    );
  }

  @Get('summary/skill-collection/:curriculumId')
  async getSkillCollectionSummaryByCurriculum(
    @Param('curriculumId') curriculumId: number, // รับ curriculumId
    @Query('studentName') studentName: string, // รับ studentName จาก query parameter
    @Query('studentCode') studentCode: string, // รับ studentCode จาก query parameter
    @Query('subjectName') subjectName: string, // รับ subjectName จาก query parameter
  ) {
    // ส่งข้อมูล curriculumId และ params ไปยัง service เพื่อกรองข้อมูล
    return this.curriculumsService.getSkillCollectionSummaryByCurriculum(
      curriculumId,
      studentName,
      studentCode,
      subjectName,
    );
  }
}
