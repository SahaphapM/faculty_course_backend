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
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseDetail } from './entities/courseDetail.entity';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { Query } from '@nestjs/common';

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

  @Patch('importStudents/:id')
  importStudents(
    @Param('id') id: string,
    @Body() courseDetails: CourseDetail[],
  ) {
    return this.coursesService.importStudents(id, courseDetails);
  }

  @Delete('removeStudent/:courseId/:courseDetailId')
  removeStudent(
    @Param('courseId') courseId: string,
    @Param('courseDetailId') courseDetailId: number,
  ) {
    return this.coursesService.removeStudent(courseId, courseDetailId);
  }
}
