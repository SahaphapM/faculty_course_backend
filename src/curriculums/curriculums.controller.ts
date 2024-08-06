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
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { CreateSubjectDto } from 'src/subjects/dto/create-subject.dto';
import { SubjectsService } from 'src/subjects/subjects.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreatePloDto } from 'src/plos/dto/create-plo.dto';
import { UsersService } from 'src/users/users.service';
import { PlosService } from 'src/plos/plos.service';
import { PaginationDto } from './dto/pagination.dto';

@Controller('curriculums')
export class CurriculumsController {
  constructor(
    private readonly curriculumsService: CurriculumsService,
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService,
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

  @Post(':id/subjects')
  async addSubject(
    @Param('id') id: string,
    @Body() createSubjectDto: CreateSubjectDto[],
  ) {
    for (let index = 0; index < createSubjectDto.length; index++) {
      const subjects = await this.subjectsService.create(
        createSubjectDto[index],
      ); // create subject to database
      await this.curriculumsService.addSubject(id, subjects);
    }
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

  @Patch(':id/removeSubject/:SubjectId')
  async removeSubject(
    @Param('id') id: string,
    @Param('SubjectId') SubjectId: string,
  ) {
    return this.curriculumsService.removeSubject(id, SubjectId);
  }

  @Patch(':id/coordinators')
  async addCoordinator(
    @Param('id') id: string,
    @Body() createUserDtos: CreateUserDto[],
  ) {
    console.log('Received data:', createUserDtos); // Log the received data

    // Ensure createUserDtos is an array
    if (!Array.isArray(createUserDtos)) {
      throw new BadRequestException('Invalid data format: Expected an array');
    }

    // Validate each item in the array
    createUserDtos.forEach((dto) => {
      if (typeof dto.id !== 'string' || dto.id.trim() === '') {
        throw new BadRequestException('Invalid ID format');
      }
    });

    const coordinators = await Promise.all(
      createUserDtos.map((dto) => this.usersService.findOne(dto.id)),
    );
    return this.curriculumsService.addCoordinator(id, coordinators); // Add user to curriculum
  }

  @Patch(':id/removeCoordinator/:CoordinatorId')
  async removeCoordinator(
    @Param('id') id: string,
    @Param('CoordinatorId') CoordinatorId: string,
  ) {
    return this.curriculumsService.removeCoordinator(id, CoordinatorId);
  }


  @Patch(':id/plos')
  async addPLO(@Param('id') id: string, @Body() createPloDtos: CreatePloDto[]) {
    console.log('Received data:', createPloDtos); // Log the received data

    // Ensure createPloDtos is an array
    if (!Array.isArray(createPloDtos)) {
      throw new BadRequestException('Invalid data format: Expected an array');
    }

    // Validate each item in the array
    createPloDtos.forEach((dto) => {
      if (typeof dto.id !== 'string' || dto.id.trim() === '') {
        throw new BadRequestException('Invalid ID format');
      }
    });

    const plos = await Promise.all(
      createPloDtos.map((dto) => this.plosService.create(dto)),
    );
    return this.curriculumsService.addPLO(id, plos); // Add PLOs to curriculum

  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curriculumsService.remove(id);
  }
}
