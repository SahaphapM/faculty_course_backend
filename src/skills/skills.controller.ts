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
  async create(
    @Param('id') id: string,
    @Body() createSkillDto: CreateSkillDto,
  ) {
    return this.skillsService.create(createSkillDto);
  }
  @Post(':id/createSubSkill')
  @HttpCode(HttpStatus.CREATED)
  async createSubSkill(
    @Param('id') id: string,
    @Body() createSkillDto: CreateSkillDto,
  ) {
    return this.skillsService.createSubSkill(id, createSkillDto);
  }
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

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Patch(':id/selectSubSkills')
  @HttpCode(HttpStatus.OK)
  updateSubSkills(@Param('id') id: string, @Body() subSkillIds: string[]) {
    return this.skillsService.updateSubSkills(id, subSkillIds);
  }

  // Unrequire
  // @Patch(':id/remove/:subId')
  // @HttpCode(HttpStatus.OK)
  // removeSubSkills(@Param('id') id: string, @Param('subId') subId: string) {
  //   return this.skillsService.removeSubSkill(id, subId);
  // }

  @Post(':id/createTechSkill')
  @HttpCode(HttpStatus.CREATED)
  async createTechSkill(
    @Param('id') id: string,
    @Body() createTechSkillDto: CreateTechSkillDto,
  ) {
    const newTechSkill =
      await this.techSkillsService.create(createTechSkillDto);
    this.skillsService.createTechSkill(id, newTechSkill);

    return;
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
