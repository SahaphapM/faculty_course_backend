import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { InstructorsService } from './instructors.service';

import { ApiBearerAuth, ApiOkResponse, ApiExtraModels, getSchemaPath, ApiQuery } from '@nestjs/swagger';
import { CreateInstructorDto } from 'src/generated/nestjs-dto/create-instructor.dto';
import { UpdateInstructorDto } from 'src/generated/nestjs-dto/update-instructor.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { InstructorFilterDto } from 'src/dto/filters/filter.instructors.dto';
import { PaginatedInstructorDto } from 'src/dto/pagination.types';

@ApiBearerAuth()
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly insService: InstructorsService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTeacherDto: CreateInstructorDto) {
    return this.insService.create(createTeacherDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @ApiExtraModels(InstructorFilterDto)
  @ApiQuery({ name: 'pag', required: false, schema: { $ref: getSchemaPath(InstructorFilterDto) }, description: 'Filter/query parameters' })
  @Get()
  @ApiOkResponse({type: PaginatedInstructorDto})
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pag?: InstructorFilterDto) {
    return this.insService.findAll(pag);
  }

  @Roles(UserRole.Admin)
  @Get('available-users')
  findAvailableInstructorsForUser(@Query() query?: InstructorFilterDto) {
    return this.insService.findAvailableInstructorsForUser(query);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.insService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateInstructorDto,
  ) {
    return this.insService.update(+id, updateTeacherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  // @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.insService.remove(+id);
  }
}
