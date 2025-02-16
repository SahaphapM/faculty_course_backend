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
import { SubjectService } from './subjects.service';
import { CreateSubjectDto } from 'src/generated/nestjs-dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/generated/nestjs-dto/update-subject.dto';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly courseSpecsService: SubjectService) {}

  @Get()
  findAll() {
    return this.courseSpecsService.findAll();
  }

  @Get('filters/:curriculumId')
  findAllByCurriculum(@Query('curriculumId') id: string) {
    return this.courseSpecsService.findAllByCurriculumId(+id);
  }

  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.courseSpecsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseSpecsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseSpecDto: UpdateSubjectDto,
  ) {
    return this.courseSpecsService.update(+id, updateCourseSpecDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseSpecsService.remove(+id);
  }
}
