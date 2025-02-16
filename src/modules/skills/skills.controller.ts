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
import { FilterParams } from 'src/dto/filter-params.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateSkillDto } from 'src/generated/nestjs-dto/create-skill.dto';
import { UpdateSkillDto } from 'src/generated/nestjs-dto/update-skill.dto';

@ApiBearerAuth()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pag?: FilterParams) {
    return this.skillsService.findAll(pag);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: number) {
    return this.skillsService.findOne(id);
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
  update(@Param('id') id: number, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.skillsService.remove(id);
  }

  // @Post(':parentId/createSubSkills') // select or create subskills use this.
  // @HttpCode(HttpStatus.CREATED)
  // async createSubSkill(
  //   @Param('parentId') id: number,
  //   @Body() createSkillDtos: CreateSkillDto,
  // ) {
  //   return this.skillsService.createSubSkills(id, createSkillDtos);
  // }

  // @Patch(':id/removeSubSkill/:subSkillId')
  // @HttpCode(HttpStatus.OK)
  // removeSubSkillId(
  //   @Param('id') id: number,
  //   @Param('subSkillId') subSkillId: number,
  // ) {
  //   return this.skillsService.removeSubSkillId(id, subSkillId);
  // }
}
