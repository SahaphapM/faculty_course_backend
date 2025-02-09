import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CourseSpecsService } from './course-specs.service';
import { CreateCourseSpecDto } from 'src/dto/course-specs/create-course-spec.dto';
import { UpdateCourseSpecDto } from 'src/dto/course-specs/update-course-spec.dto';

@Controller('course-specs')
export class CourseSpecsController {
  constructor(private readonly courseSpecsService: CourseSpecsService) {}

  @Post(':curriculumId')
  createCourseSpec(
    @Param('curriculumId') curriculumId: number,
    @Body() createCourseSpecDto: CreateCourseSpecDto,
  ) {
    return this.courseSpecsService.createCourseSpec(
      curriculumId,
      createCourseSpecDto,
    );
  }

  @Post()
  create(@Body() createCourseSpecDto: CreateCourseSpecDto) {
    return this.courseSpecsService.create(createCourseSpecDto);
  }

  @Get()
  findAll() {
    return this.courseSpecsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseSpecsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseSpecDto: UpdateCourseSpecDto,
  ) {
    return this.courseSpecsService.update(+id, updateCourseSpecDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseSpecsService.remove(+id);
  }
}
