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
import { PaginationDto } from 'src/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateSubjectDto } from 'src/generated/nestjs-dto/create-subject.dto';
import { UpdateSubjectDto } from 'src/generated/nestjs-dto/update-subject.dto';
// import { CreateSkillCollection } from 'src/dto/skill/skill-collection.dto';
// import { SkillExpectedLevel } from 'src/entities/skill-exp-lvl';

@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private subjectsService: LessonsService) {}

  @Get()
  findAll(@Query() pag?: PaginationDto) {
    return this.subjectsService.findAll(pag);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(+id);
  }

  @Post()
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(+id, updateSubjectDto);
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
