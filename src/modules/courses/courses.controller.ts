import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseService } from './courses.service';
import { Query } from '@nestjs/common';
import { PaginationDto } from 'src/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCourseDto } from 'src/generated/nestjs-dto/create-course.dto';
import { UpdateCourseDto } from 'src/generated/nestjs-dto/update-course.dto';

@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CourseService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll(@Query() pag?: PaginationDto) {
    return this.coursesService.findAll(pag);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @Get(':id/enrollments')
  findCourseEnrollment(@Param('id') id: string) {
    return this.coursesService.findCourseEnrollmentByCourseId(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }

  @Patch(':id/import-students')
  importStudents(
    @Param('id') courseId: string,
    @Body() studentListId: string[],
  ) {
    return this.coursesService.importStudents(+courseId, studentListId);
  }

  @Delete(':id/remove-enrollment/:enId')
  removeStudent(
    @Param('id') courseId: string,
    @Param('enId') enrollId: number,
  ) {
    return this.coursesService.removeEnrollment(+courseId, enrollId);
  }
}
