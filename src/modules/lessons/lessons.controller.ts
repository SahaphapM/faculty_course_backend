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
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from 'src/generated/nestjs-dto/create-lesson.dto';
import { UpdateLessonDto } from 'src/generated/nestjs-dto/update-lesson.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { LessonFilterDto } from 'src/dto/filters/filter.lesson.dto';

@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
  constructor(private subjectsService: LessonsService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
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
    name: 'thaiName',
    required: false,
    description: 'Filter by Thai name (contains)',
  })
  @ApiQuery({
    name: 'engName',
    required: false,
    description: 'Filter by English name (contains)',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Sort direction (asc|desc)',
  })
  @Get()
  findAll(@Query() pag?: LessonFilterDto) {
    return this.subjectsService.findAll(pag);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  create(@Body() dto: CreateLessonDto) {
    return this.subjectsService.create(dto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.subjectsService.update(+id, dto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(+id);
  }
}
