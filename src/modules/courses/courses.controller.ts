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
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCourseDto } from 'src/generated/nestjs-dto/create-course.dto';
import { UpdateCourseDto } from 'src/generated/nestjs-dto/update-course.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { FilterCourse } from 'src/dto/filter-course.dto';
import { ScoreSkillCollectionDto } from 'src/dto/score-collection.dto';

@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CourseService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll(@Query() pag?: FilterCourse) {
    return this.coursesService.findAll(pag);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(+id, updateCourseDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Post(':id/skill-collections')
  updateSkillCollection(
    @Param('id') courseId: string,
    @Body() list: ScoreSkillCollectionDto,
  ) {
    return this.coursesService.upsertSkillCollection(+courseId, list);
  }

  // * all below is old
  /*  @Get(':id/enrollments')
  findCourseEnrollment(@Param('id') id: string) {
    return this.coursesService.findCourseEnrollmentByCourseId(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id/import-students')
  importStudents(
    @Param('id') courseId: string,
    @Body() studentListId: string[],
  ) {
    return this.coursesService.importStudents(+courseId, studentListId);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Delete(':id/remove-enrollment/:enId')
  removeStudent(
    @Param('id') courseId: string,
    @Param('enId') enrollId: number,
  ) {
    return this.coursesService.removeEnrollment(+courseId, enrollId);
  } */
}
