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
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('subjects')
export class SubjectController {
  constructor(private readonly courseSpecsService: SubjectService) {}

  @Get()
  findAll(@Query() pag?: BaseFilterParams) {
    return this.courseSpecsService.findAll(pag);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.courseSpecsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseSpecsService.findOne(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseSpecDto: UpdateSubjectDto,
  ) {
    return this.courseSpecsService.update(+id, updateCourseSpecDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseSpecsService.remove(+id);
  }
}
