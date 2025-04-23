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
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateSkillDto } from 'src/generated/nestjs-dto/create-skill.dto';
import { UpdateSkillDto } from 'src/generated/nestjs-dto/update-skill.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SkillFilterDto } from 'src/dto/filters/filter.skill.dto';

@ApiBearerAuth()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pag?: SkillFilterDto) {
    return this.skillsService.findAll(pag);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: number) {
    return this.skillsService.findOne(id);
  }

  // ! bug
  // @Get('options')
  // findOptions(@Query() curriculumId: number) {
  //   return this.skillsService.findOptions(curriculumId);
  // }

  @Get('options/:curriculumId')
  findOptions(@Param('curriculumId') curriculumId: number) {
    return this.skillsService.findOptions(curriculumId);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: number, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.skillsService.remove(id);
  }
}
