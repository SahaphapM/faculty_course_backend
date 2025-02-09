import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateSkillDto } from 'src/dto/skill/create-skill.dto';
import { UpdateSkillDto } from 'src/dto/skill/update-skill.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pag?: PaginationDto) {
    return this.skillsService.findAll(pag);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(+id);
  }

  @Get('/curriculumId/:curriculumId')
  @HttpCode(HttpStatus.OK)
  findAllByCurriculum(@Param('curriculumId') curriculumId: number) {
    return this.skillsService.findAllByCurriculum(curriculumId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(+id, updateSkillDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.skillsService.remove(+id);
  }

  ///////////  subSkill /////////////

  @Patch(':id/selectSubSkills') // select or create subskills use this.
  @HttpCode(HttpStatus.CREATED)
  async selectSubSkills(
    @Param('id') id: string,
    @Body() createSkillDtos: CreateSkillDto,
  ) {
    return this.skillsService.selectSubSkills(+id, createSkillDtos);
  }

  @Post(':id/createSubSkills') // select or create subskills use this.
  @HttpCode(HttpStatus.CREATED)
  async createSubSkill(
    @Param('id') id: string,
    @Body() createSkillDtos: CreateSkillDto,
  ) {
    return this.skillsService.createSubSkills(+id, createSkillDtos);
  }

  @Patch(':id/removeSubSkill/:subSkillId')
  @HttpCode(HttpStatus.OK)
  removeSubSkillId(
    @Param('id') id: string,
    @Param('subSkillId') subSkillId: string,
  ) {
    return this.skillsService.removeSubSkillId(+id, +subSkillId);
  }
}
