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

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }
  @Get('pages')
  findAllByPage(@Query() paginationDto: PaginationDto) {
    return this.skillsService.findAllByPage(paginationDto);
  }
  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Patch(':id/addSubSkills')
  updateSubSkills(
    @Param('id') id: string,
    @Body() createSkillsDto: CreateSkillDto[],
  ) {
    return this.skillsService.updateSubSkills(id, createSkillsDto);
  }

  @Patch(':id/remove/:subId')
  removeSubSkills(@Param('id') id: string, @Param('subId') subId: string) {
    return this.skillsService.removeSubSkills(id, subId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }
}
