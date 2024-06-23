import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { CreateSubjectDto } from 'src/subjects/dto/create-subject.dto';
import { SubjectsService } from 'src/subjects/subjects.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreatePloDto } from 'src/plos/dto/create-plo.dto';
import { UsersService } from 'src/users/users.service';
import { PlosService } from 'src/plos/plos.service';

@Controller('curriculums')
export class CurriculumsController {
  constructor(
    private readonly curriculumsService: CurriculumsService,
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService,
    private readonly plosService: PlosService,
  ) {}

  @Post()
  create(@Body() createCurriculumDto: CreateCurriculumDto) {
    return this.curriculumsService.create(createCurriculumDto);
  }

  @Get()
  findAll() {
    return this.curriculumsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.curriculumsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ) {
    return this.curriculumsService.update(id, updateCurriculumDto);
  }

  @Patch(':id/subjects')
  async addSubject(
    @Param('id') id: string,
    @Body() createSubjectDto: CreateSubjectDto,
  ) {
    const subject = await this.subjectsService.create(createSubjectDto); // create subject to database
    return this.curriculumsService.addSubject(id, subject); // add subject to curriculum
  }

  @Patch(':id/cordinators')
  async addCordinator(
    @Param('id') id: string,
    @Body() createUserDto: CreateUserDto,
  ) {
    const cordinator = await this.usersService.findOne(createUserDto.id); // find user in database by id
    return this.curriculumsService.addCordinator(id, cordinator); // add user to curriculum
  }

  @Patch(':id/plos')
  async addPLO(@Param('id') id: string, @Body() createPloDto: CreatePloDto) {
    const plo = await this.plosService.create(createPloDto); // create plo to database
    return this.curriculumsService.addPLO(id, plo); // add plo to curriculum
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curriculumsService.remove(id);
  }
}
