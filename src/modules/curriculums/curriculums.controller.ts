import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CreateCurriculumDto } from '../../dto/curriculum/create-curriculum.dto';
import { UpdateCurriculumDto } from '../../dto/curriculum/update-curriculum.dto';
import { SubjectsService } from 'src/modules/subjects/subjects.service';

import { CreatePloDto } from 'src/dto/plo/create-plo.dto';
import { PlosService } from 'src/modules/plos/plos.service';
import { PaginationDto } from '../../dto/pagination.dto';
import { CreateSubjectDto } from 'src/dto/subject/create-subject.dto';

@Controller('curriculums')
export class CurriculumsController {
  constructor(
    private readonly curriculumsService: CurriculumsService,
    private readonly subjectsService: SubjectsService,
    private readonly plosService: PlosService,
  ) {}

  @Get('pages')
  findAllByPage(@Query() paginationDto: PaginationDto) {
    return this.curriculumsService.findAllByPage(paginationDto);
  }

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
    @Body() createSubjectDtos: CreateSubjectDto[],
  ) {
    console.log('Received data:', createSubjectDtos); // Log the received data

    // Ensure createSubjectDtos is an array
    if (!Array.isArray(createSubjectDtos)) {
      throw new BadRequestException('Invalid data format: Expected an array');
    }

    // Validate each item in the array
    createSubjectDtos.forEach((dto) => {
      if (typeof dto.id !== 'string' || dto.id.trim() === '') {
        throw new BadRequestException('Invalid subject name format');
      }
    });

    const subjects = await Promise.all(
      createSubjectDtos.map((dto) => this.subjectsService.create(dto)),
    );

    await Promise.all(
      subjects.map(() => this.curriculumsService.addSubject(id, subjects)),
    );

    return this.curriculumsService.findOne(id); // add subject to curriculum
  }

  @Patch(':id/selectSubjects')
  async selectSubject(
    @Param('id') id: string,
    @Body() createSubjectDtos: CreateSubjectDto[],
  ) {
    // option and select the former subjects
    const subjects = await Promise.all(
      createSubjectDtos.map((dto) => this.subjectsService.findOne(dto.id)),
    );
    return this.curriculumsService.selectSubject(id, subjects); // add subject to curriculum
  }

  @Patch(':id/coordinators')
  async addCoordinator(
    @Param('id') id: string,
    @Body() createTeacherDtos: { id: string }[],
  ) {
    return this.curriculumsService.addCoordinator(id, createTeacherDtos); // Add teacher to curriculum
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
