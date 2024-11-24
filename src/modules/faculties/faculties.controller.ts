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
import { FacultiesService } from './faculties.service';
import { CreateFacultyDto } from '../../dto/faculty/create-faculty.dto';
import { UpdateFacultyDto } from '../../dto/faculty/update-faculty.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from 'src/dto/pagination.dto';

@ApiBearerAuth()
@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) { }

  @Post()
  create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultiesService.create(createFacultyDto);
  }

  @Get()
  findAll(@Query() pag?: PaginationDto) {
    return this.facultiesService.findAll(pag);
  }

  // @Get('getAllDetails')
  // findAllDetails() {
  //   return this.facultiesService.findAllDetails();
  // }

  @Get('filters')
  findFilters() {
    return this.facultiesService.findFilters();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facultiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto) {
    return this.facultiesService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facultiesService.remove(id);
  }
}
