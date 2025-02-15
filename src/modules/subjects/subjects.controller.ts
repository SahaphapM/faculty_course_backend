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
import { CourseSpecsService } from './subjects.service';
import { CreateCourseSpecDto } from 'src/generated/nestjs-dto/create-courseSpec.dto';
import { UpdateCourseSpecDto } from 'src/generated/nestjs-dto/update-courseSpec.dto';

@Controller('subjects')
export class CourseSpecsController {
  constructor(private readonly courseSpecsService: CourseSpecsService) {}

  @Get()
  findAll() {
    return this.courseSpecsService.findAll();
  }

  @Get(':curriculumId')
  findAllByCurriculum(@Query('curriculumId') id: string) {
    return this.courseSpecsService.findAllByCurriculumId(+id);
  }

  @Post()
  createByCurriculum(@Body() dto: CreateCourseSpecDto) {
    return this.courseSpecsService.create(dto);
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
