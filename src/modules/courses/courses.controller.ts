import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Query } from '@nestjs/common';
import { CreateCourseDto } from 'src/dto/course/create-course.dto';
import { UpdateCourseDto } from 'src/dto/course/update-course.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CourseEnrollment } from 'src/entities/course-enrollment';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('pages')
  findAllByPage(@Query() paginationDto: PaginationDto) {
    return this.coursesService.findAllByPage(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  @Patch('selectSubject/:id/:subjectId')
  selectSubject(
    @Param('id') id: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.coursesService.selectSubject(id, subjectId);
  }

  @Patch(':id/import-enrollment')
  importStudents(
    @Param('id') courseId: string,
    @Body() enroll: CourseEnrollment[],
  ) {
    return this.coursesService.importEnrollment(courseId, enroll);
  }

  @Delete(':id/remove-enrollment/:enId')
  removeStudent(
    @Param('id') courseId: string,
    @Param('enId') enrollId: number,
  ) {
    return this.coursesService.removeEnrollment(courseId, enrollId);
  }
}
