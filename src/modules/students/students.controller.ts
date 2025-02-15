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
import { PaginationDto } from 'src/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateStudentDto } from 'src/generated/nestjs-dto/create-student.dto';
import { UpdateStudentDto } from 'src/generated/nestjs-dto/update-student.dto';

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
  findAll(@Query() pag?: PaginationDto) {
    return this.studentsService.findAll(pag);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  // @Get('skill-tree/:id')
  // findProfile(@Param('id') id: string) {
  //   return this.studentsService.buildSkillCollectionTree(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
