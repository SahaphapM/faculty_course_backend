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
import { CreateCloDto } from 'src/dto/clo/create-clo.dto';
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
  ) { }

  @Get('pages')
  findAllByPage(@Query() paginationDto: PaginationDto) {
    return this.subjectsService.findAllByPage(paginationDto);
  }

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
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

  // add new clos in subject // composition relation
  @Post(':id/clo')
  async addPLO(@Param('id') id: string, @Body() createCloDto: CreateCloDto) {
    const plo = await this.closService.create(createCloDto); // create clo to database
    return this.subjectsService.addCLO(id, plo); // add clo to curriculum
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
