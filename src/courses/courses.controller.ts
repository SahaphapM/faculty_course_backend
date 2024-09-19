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
