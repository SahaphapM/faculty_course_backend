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
import { SkillDetail } from 'src/entities/skillDetail.entity';
import { SkillMapping } from '../../entities/subject.entity';
import { CreateCloDto } from 'src/dto/clo/create-clo.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateSubjectDto } from 'src/dto/subject/create-subject.dto';
import { UpdateSubjectDto } from 'src/dto/subject/update-subject.dto';
import { ClosService } from '../clos/clos.service';

@Controller('subjects')
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly closService: ClosService,
  ) {}

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

  // Select SkillDetails in subject // aggration relation
  @Post('skillDetails/:subjectId')
  async selectSkills(
    @Param('subjectId') id: string,
    @Body() skillDetails: SkillDetail[],
  ) {
    return this.subjectsService.selectSkills(id, skillDetails); // select skill to curriculum
  }

  // Update SkillDetail
  @Patch('skillDetails')
  async updateSkillDetail(@Body() skillDetails: SkillDetail) {
    return this.subjectsService.updateSkillDetail(skillDetails); // select skill to curriculum
  }

  // remove SkillDetail from subject
  @Delete('skillDetails/:subjectId/:skillDetailId')
  async removeSkillDetail(
    @Param('subjectId') subjectId: string,
    @Param('skillDetailId') skillDetailId: number,
  ) {
    return await this.subjectsService.removeSkill(subjectId, skillDetailId);
  }

  // add new clos in subject // composition relation
  @Post(':id/clo')
  async addPLO(@Param('id') id: string, @Body() createCloDto: CreateCloDto) {
    const plo = await this.closService.create(createCloDto); // create clo to database
    return this.subjectsService.addCLO(id, plo); // add clo to curriculum
  }

  @Post('skillMappings')
  async skillMappings(@Body() skillMaping: SkillMapping[]) {
    return this.subjectsService.skillMappings(skillMaping); // mapping skill with skill detail
  }
}
