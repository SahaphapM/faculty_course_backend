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
import { InternshipsService } from './internships.service';
import { CreateInternshipWithStudentDto } from './dto/create.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { ApiQuery } from '@nestjs/swagger';

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
}
