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
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubjectFilterDto } from 'src/dto/filters/filter.subject.dto';

@ApiBearerAuth()
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectsService: SubjectService) {}

  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort field, prefix with - for DESC (e.g. -id)',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Explicit sort direction (asc|desc) overrides sort prefix',
  })
  @ApiQuery({
    name: 'nameCode',
    required: false,
    description: 'Filter by code or Thai/English name (contains)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by subject type',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: Number,
    description: 'Filter by branch id (via related curriculum)',
  })
  @ApiQuery({
    name: 'facultyId',
    required: false,
    type: Number,
    description: 'Filter by faculty id (via related curriculum branch)',
  })
  @ApiQuery({
    name: 'curriculumId',
    required: false,
    type: Number,
    description: 'Filter by curriculum id',
  })
  @Get()
  findAll(@Query() pag?: SubjectFilterDto) {
    return this.subjectsService.findAll(pag);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }
  @Get('subject-code/:code')
  findOneByCode(@Param('code') code: string) {
    return this.subjectsService.findOneByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubjectSpecDto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(+id, updateSubjectSpecDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(+id);
  }
}
