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
import { CreateTechSkillDto } from 'src/modules/tech-skills/dto/create-tech-skill.dto';
import { TechSkillsService } from 'src/modules/tech-skills/tech-skills.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateSkillDto } from 'src/dto/skill/create-skill.dto';
import { UpdateSkillDto } from 'src/dto/skill/update-skill.dto';

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }

  ///////////  subSkill /////////////

  @Patch(':id/selectSubSkills') // select or create subskills use this.
  @HttpCode(HttpStatus.CREATED)
  async selectSubSkills(
    @Param('id') id: string,
    @Body() createSkillDtos: CreateSkillDto,
  ) {
    return this.skillsService.selectSubSkills(id, createSkillDtos);
  }

  @Post(':id/createSubSkills') // select or create subskills use this.
  @HttpCode(HttpStatus.CREATED)
  async createSubSkill(
    @Param('id') id: string,
    @Body() createSkillDtos: CreateSkillDto,
  ) {
    return this.skillsService.createSubSkills(id, createSkillDtos);
  }

  @Patch(':id/removeSubSkill/:subSkillId')
  @HttpCode(HttpStatus.OK)
  removeSubSkillId(
    @Param('id') id: string,
    @Param('subSkillId') subSkillId: string,
  ) {
    return this.skillsService.removeSubSkillId(id, subSkillId);
  }

  ///////// techSkill /////////////

  @Post(':id/createTechSkills') // select or create subskills use this.
  @HttpCode(HttpStatus.CREATED)
  async createTechSkill(
    @Param('id') id: string,
    @Body() createTechSkillDtos: CreateTechSkillDto[],
  ) {
    const techSkills = await Promise.all(
      createTechSkillDtos.map(async (dto) => {
        const techSkill = await this.techSkillsService.findOne(dto.id);
        return techSkill || this.techSkillsService.create(dto);
      }),
    );
    return this.skillsService.createTechSkills(id, techSkills);
  }

  // @Patch(':id/selectTechSkills')
  // @HttpCode(HttpStatus.OK)
  // updateTechSkills(@Param('id') id: string, @Body() techSkillIds: string[]) {
  //   return this.skillsService.updateTechSkills(id, techSkillIds);
  // }

  @Patch(':id/removeTechSkill/:techId')
  @HttpCode(HttpStatus.OK)
  removeTechSkills(@Param('id') id: string, @Param('techId') TechId: string) {
    return this.skillsService.removeTechSkill(id, TechId);
  }
}
