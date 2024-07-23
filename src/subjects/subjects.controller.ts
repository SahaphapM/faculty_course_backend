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
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { ClosService } from 'src/clos/clos.service';
import { SkillsService } from 'src/skills/skills.service';
import { CreateCloDto } from 'src/clos/dto/create-clo.dto';
import { CreateSkillDto } from 'src/skills/dto/create-skill.dto';
import { PaginationDto } from 'src/users/dto/pagination.dto';

@Controller('subjects')
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService,
    private readonly closService: ClosService,
    private readonly skillsService: SkillsService,
  ) { }

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

  // @Patch(':id/teachers')
  // async addTeacher(
  //   @Param('id') id: string,
  //   @Body() createUserDto: CreateUserDto,
  // ) {
  //   console.log(createUserDto);
  //   const teacher = await this.usersService.findOne(createUserDto.id); // find user in database by id
  //   console.log(teacher);
  //   return this.subjectsService.addTeacher(id, teacher); // add user to curriculum
  // }

  @Patch(':id/clos')
  async addPLO(@Param('id') id: string, @Body() createCloDto: CreateCloDto) {
    const plo = await this.closService.create(createCloDto); // create clo to database
    return this.subjectsService.addCLO(id, plo); // add clo to curriculum
  }

  // @Patch(':id/skills')
  // async addSkill(
  //   @Param('id') id: string,
  //   @Body() createSkillDto: CreateSkillDto,
  // ) {
  //   let skill = await this.skillsService.findOne(createSkillDto.id);
  //   if (!skill) {
  //     skill = await this.skillsService.create(createSkillDto); // create skill to database
  //   }

  //   return this.subjectsService.addSkill(id, skill); // add skill to curriculum
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
