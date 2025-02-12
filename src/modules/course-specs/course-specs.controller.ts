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

const pathCurr = 'curriculumId';

@Controller('course-specs')
export class CourseSpecsController {
  constructor(private readonly courseSpecsService: CourseSpecsService) {}

  @Post()
  createCourseSpec(@Body() createCourseSpecDto: CreateCourseSpecDto) {
    return this.courseSpecsService.createCourseSpec(createCourseSpecDto);
  }

  // @Post()
  // create(@Body() createCourseSpecDto: CreateCourseSpecDto) {
  //   return this.courseSpecsService.create(createCourseSpecDto);
  // }

  @Get()
  findAll() {
    return this.courseSpecsService.findAll();
  }

  @Get(`${pathCurr}/:id`)
  findAllByCurriculum(@Param('curriculumId') id: string) {
    return this.courseSpecsService.findAllByCurriculum(+id);
  }

  @Get(`findExistSubject/:code`)
  findExistSubject(@Param('code') code: string) {
    return this.courseSpecsService.findExistSubject(code);
  }

  @Patch(`${pathCurr}/:id`)
  updateByCurriculum(
    @Param('curriculumId') id: string,
    @Body() updateCourseSpecDto: UpdateCourseSpecDto,
  ) {
    return this.courseSpecsService.saveByCurrId(+id, updateCourseSpecDto);
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
