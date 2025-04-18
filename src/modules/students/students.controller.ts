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
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateStudentDto } from 'src/generated/nestjs-dto/create-student.dto';
import { UpdateStudentDto } from 'src/generated/nestjs-dto/update-student.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles(
    UserRole.Admin,
    UserRole.Coordinator,
    UserRole.Instructor,
    UserRole.Student,
  )
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Post('import')
  importStudents(@Body() students: CreateStudentDto[]) {
    return this.studentsService.importStudents(students);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get()
  findAll(@Query() pag?: BaseFilterParams) {
    return this.studentsService.findAll(pag);
  }

  @Roles(
    UserRole.Admin,
    UserRole.Coordinator,
    UserRole.Instructor,
    UserRole.Student,
  )
  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.studentsService.findOne(code);
  }

  // @Get('skill-tree/:id')
  // findProfile(@Param('id') id: string) {
  //   return this.studentsService.buildSkillCollectionTree(+id);
  // }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
