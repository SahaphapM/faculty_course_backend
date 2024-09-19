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
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { ClosService } from 'src/clos/clos.service';
import { CreateCloDto } from 'src/clos/dto/create-clo.dto';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { SkillDetail } from 'src/skills/entities/skillDetail.entity';

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
}
