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
import { FilterParams } from 'src/dto/filter-params.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from 'src/generated/nestjs-dto/create-lesson.dto';
import { UpdateLessonDto } from 'src/generated/nestjs-dto/update-lesson.dto';

@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private subjectsService: LessonsService) {}

  @Get()
  findAll(@Query() pag?: FilterParams) {
    return this.subjectsService.findAll(pag);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateLessonDto) {
    return this.subjectsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.subjectsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(+id);
  }

  // @Get('filters/:curriculumId')
  // async filters(@Param('curriculumId') curriculumId: string) {
  //   return this.subjectsService.filters(curriculumId);
  // }
}
