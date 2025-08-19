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
import { CourseService } from './courses.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateCourseDto } from 'src/generated/nestjs-dto/update-course.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CourseFilterDto } from 'src/dto/filters/filter.course.dto';
import { CreateCourseDtoWithInstructor } from './dto/create-course-with-instructor.dto';
import { PaginatedCourseDto } from 'src/dto/pagination.types';

@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CourseService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @ApiQuery({ name: 'InstructorId', required: false })
  @ApiBody({ type: CreateCourseDtoWithInstructor, isArray: true })
  @Post()
  create(@Body() createCourseDto: CreateCourseDtoWithInstructor[]) {
    return this.coursesService.create(createCourseDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @ApiQuery({ name: 'InstructorId', required: false })
  @Get()
  @ApiOkResponse({ type: PaginatedCourseDto })
  findAll(
    @Query() pag?: CourseFilterDto,
    @Query('InstructorId') instructorId?: number,
  ) {
    return this.coursesService.findAll(pag, instructorId);
  }

  @Get('options')
  findAllOptions() {
    return this.coursesService.findAllOptions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    console.log('Update Path', updateCourseDto);
    return this.coursesService.update(+id, updateCourseDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id/instructor')
  assignInstructor(
    @Param('id') id: string,
    @Body() body: { instructorIds: number[] },
  ) {
    return this.coursesService.assignInstructor(+id, body.instructorIds);
  }
}
