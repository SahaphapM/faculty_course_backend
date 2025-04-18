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
import { PloService } from './plos.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreatePloDto } from 'src/generated/nestjs-dto/create-plo.dto';
import { UpdatePloDto } from 'src/generated/nestjs-dto/update-plo.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@ApiBearerAuth()
@Controller('plos')
export class PlosController {
  constructor(private readonly plosService: PloService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Post()
  create(@Body() createPloDto: CreatePloDto) {
    return this.plosService.create(createPloDto);
  }

  @Get()
  findAll(@Query() filter?: BaseFilterParams) {
    return this.plosService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plosService.findOne(+id);
  }

  // ! bug
  // @Get('options')
  // findOptions(@Query() curriculumId: number) {
  //   return this.plosService.findOptions(curriculumId);
  // }

  @Get('options/:curriculumId')
  findOptions(@Param('curriculumId') curriculumId: number) {
    return this.plosService.findOptions(curriculumId);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePloDto: UpdatePloDto) {
    return this.plosService.update(+id, updatePloDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plosService.remove(+id);
  }
}
