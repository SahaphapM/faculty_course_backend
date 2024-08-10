import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TechSkillsService } from './tech-skills.service';
import { CreateTechSkillDto } from './dto/create-tech-skill.dto';
import { UpdateTechSkillDto } from './dto/update-tech-skill.dto';

@Controller('techSkills')
export class TechSkillsController {
  constructor(private readonly techSkillsService: TechSkillsService) {}

  @Post()
  create(@Body() createTechSkillDto: CreateTechSkillDto) {
    return this.techSkillsService.create(createTechSkillDto);
  }

  @Get()
  findAll() {
    return this.techSkillsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.techSkillsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTechSkillDto: UpdateTechSkillDto,
  ) {
    return this.techSkillsService.update(id, updateTechSkillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.techSkillsService.remove(id);
  }
}
