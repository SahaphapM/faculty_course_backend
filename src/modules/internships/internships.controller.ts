import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { CreateInternshipWithStudentDto } from './dto/create.dto';
import { Query } from '@nestjs/common';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Post()
  create(@Body() createInternshipDto: CreateInternshipWithStudentDto) {
    return this.internshipsService.create(createInternshipDto);
  }

  @Get()
  @ApiQuery({ name: 'year', required: false })
  findAll(@Query() pag?: BaseFilterParams, @Query('year') year?: number) {
    return this.internshipsService.findAllPagination(pag, year);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internshipsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInternshipDto: CreateInternshipWithStudentDto,
  ) {
    return this.internshipsService.update(+id, updateInternshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.internshipsService.remove(+id);
  }

  @Get(':id/skill-assessment')
  getSkillAssessment(@Param('id') id: string) {
    return this.internshipsService.skillAssessment(+id);
  }

  @Get(':id/students/:studentId/assessment')
  @ApiParam({ name: 'studentId', type: String, description: 'Student ID' })
  getStudentAssessment(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    return this.internshipsService.getStudentAssessment(+id, +studentId);
  }
}
