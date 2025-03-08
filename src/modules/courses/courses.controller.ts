import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CourseService } from './courses.service';
import { Query } from '@nestjs/common';
import { FilterParams, StudentScoreList } from 'src/dto/filter-params.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCourseDto } from 'src/generated/nestjs-dto/create-course.dto';
import { UpdateCourseDto } from 'src/generated/nestjs-dto/update-course.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

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
  findAll(@Query() pag?: FilterParams) {
    return this.coursesService.findAll(pag);
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

  /////// import skill collections
  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch('import/skill-collections')
  importSkill(
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('cloId', ParseIntPipe) cloId: number, // ✅ รับค่าจาก Query Params
    @Body() studentScoreList: StudentScoreList[], // ✅ ใช้ DTO
  ) {
    console.log('Import Path');
    return this.coursesService.importSkillCollections(
      courseId,
      cloId,
      studentScoreList,
    );
  }
}
