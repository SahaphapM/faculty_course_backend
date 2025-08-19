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
import { ApiBearerAuth, ApiOkResponse, ApiExtraModels, getSchemaPath, ApiQuery } from '@nestjs/swagger';
import { CreateFacultyDto } from 'src/generated/nestjs-dto/create-faculty.dto';
import { UpdateFacultyDto } from 'src/generated/nestjs-dto/update-faculty.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { FacultyFilterDto } from 'src/dto/filters/filter.faculties.dto';
import { PaginatedFacultyDto } from 'src/dto/pagination.types';

@ApiBearerAuth()
@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Roles(UserRole.Admin)
  @Post()
  create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultiesService.create(createFacultyDto);
  }

  @ApiExtraModels(FacultyFilterDto)
  @ApiQuery({ name: 'pag', required: false, schema: { $ref: getSchemaPath(FacultyFilterDto) }, description: 'Filter/query parameters' })
  @Get()
  @ApiOkResponse({type: PaginatedFacultyDto})
  findAll(@Query() pag?: FacultyFilterDto) {
    return this.facultiesService.findAll(pag);
  }

  @Get('filters')
  findFilters() {
    return this.facultiesService.findFilters();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facultiesService.findOne(+id);
  }

  @Roles(UserRole.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto) {
    return this.facultiesService.update(+id, updateFacultyDto);
  }

  @Roles(UserRole.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.facultiesService.remove(+id);
  }
}
