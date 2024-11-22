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
import { StudentsService } from './students.service';
import { CreateStudentDto } from '../../dto/student/create-student.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Post('import')
  importStudents(@Body() students: CreateStudentDto[]) {
    return this.studentsService.importStudents(students);
  }

  @Get()
  findAll(@Query() paginationDto?: PaginationDto) {
    if (paginationDto) return this.studentsService.findAllByPage(paginationDto);
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get('skill-tree/:id')
  findProfile(@Param('id') id: string) {
    return this.studentsService.buildSkillCollectionTree(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: CreateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
