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
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreateTechSkillDto } from 'src/tech-skills/dto/create-tech-skill.dto';
import { TechSkillsService } from 'src/tech-skills/tech-skills.service';

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    private readonly techSkillsService: TechSkillsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Post(':id/createChilds')
  @HttpCode(HttpStatus.CREATED)
  async createChilds(
    @Param('id') parentId: string,
    @Body() createSkillDtos: CreateSkillDto[],
  ) {
    return this.skillsService.createChilds(parentId, createSkillDtos);
  }

  // @Post(':id/createSubSkill')
  // @HttpCode(HttpStatus.CREATED)
  // async createSubSkill(
  //   @Param('id') id: string,
  //   @Body() createSkillDto: CreateSkillDto,
  // ) {
  //   return this.skillsService.createSubSkill(id, createSkillDto);
  // }

  @Get('pages')
  @HttpCode(HttpStatus.OK)
  findAllByPage(@Query() paginationDto: PaginationDto) {
    return this.skillsService.findAllByPage(paginationDto);
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.skillsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Get('tree')
  async findTree() {
    return this.skillsService.findTree();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Patch(':id/selectChildSkills')
  @HttpCode(HttpStatus.OK)
  updateSubSkills(@Param('id') parentId: string, @Body() childrenId: string[]) {
    return this.skillsService.selectChild(parentId, childrenId);
  }

  // Unrequire
  @Patch(':id/removeChild/:childId')
  @HttpCode(HttpStatus.OK)
  removeChildSkill(@Param('id') id: string, @Param('childId') childId: string) {
    return this.skillsService.removeChildSkill(id, childId);
  }

  @Post(':id/createTechSkill')
  @HttpCode(HttpStatus.CREATED)
  async createTechSkill(
    @Param('id') id: string,
    @Body() createTechSkillDto: CreateTechSkillDto,
  ) {
    const newTechSkill =
      await this.techSkillsService.create(createTechSkillDto);
    return this.skillsService.createTechSkill(id, newTechSkill);
  }

  @Patch(':id/selectTechSkills')
  @HttpCode(HttpStatus.OK)
  updateTechSkills(@Param('id') id: string, @Body() techSkillIds: string[]) {
    return this.skillsService.updateTechSkills(id, techSkillIds);
  }

  // Unrequire
  // @Patch(':id/remove/:techId')
  // @HttpCode(HttpStatus.OK)
  // removeTechSkills(@Param('id') id: string, @Param('techId') TechId: string) {
  //   return this.skillsService.removeTechSkill(id, TechId);
  // }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }
}
