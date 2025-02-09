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
import { SubjectsService } from './subjects.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateSubjectDto } from 'src/dto/subject/create-subject.dto';
import { UpdateSubjectDto } from 'src/dto/subject/update-subject.dto';
import { ClosService } from '../clos/clos.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateSkillCollection } from 'src/dto/skill/skill-collection.dto';
import { SkillExpectedLevel } from 'src/entities/skill-exp-lvl';

@ApiBearerAuth()
@Controller('subjects')
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly closService: ClosService,
  ) {}

  @Get()
  findAll(@Query() pag?: PaginationDto) {
    return this.subjectsService.findAll(pag);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }

  // Select SkillExpectedLevels in subject // aggration relation
  @Post('skillExpectedLevels/:subjectId')
  async selectSkills(
    @Param('subjectId') id: string,
    @Body() skillExpectedLevels: SkillExpectedLevel[],
  ) {
    return this.subjectsService.selectSkills(id, skillExpectedLevels); // select skill to curriculum
  }

  // Update SkillExpectedLevel
  @Patch('skillExpectedLevels')
  async updateSkillExpectedLevel(
    @Body() skillExpectedLevels: SkillExpectedLevel,
  ) {
    return this.subjectsService.updateSkillExpectedLevel(skillExpectedLevels); // select skill to curriculum
  }

  // remove SkillExpectedLevel from subject
  @Delete('skillExpectedLevels/:subjectId/:skillExpectedLevelId')
  async removeSkillExpectedLevel(
    @Param('subjectId') subjectId: string,
    @Param('skillExpectedLevelId') skillExpectedLevelId: number,
  ) {
    return await this.subjectsService.removeSkill(
      subjectId,
      skillExpectedLevelId,
    );
  }

  @Post('skill-mappings')
  async skillMappings(@Body() skill: CreateSkillCollection[]) {
    return this.subjectsService.skillMappings(skill); // mapping skill with skill detail
  }

  @Get('filters/:curriculumId')
  async filters(@Param('curriculumId') curriculumId: string) {
    return this.subjectsService.filters(curriculumId);
  }
}
