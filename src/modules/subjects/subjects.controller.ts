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
import { ApiBearerAuth } from '@nestjs/swagger';
import { SubjectFilterDto } from 'src/dto/filters/filter.subject.dto';

@ApiBearerAuth()
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectsService: SubjectService) {}

  @Get()
  findAll(@Query() pag?: SubjectFilterDto) {
    return this.subjectsService.findAll(pag);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
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
