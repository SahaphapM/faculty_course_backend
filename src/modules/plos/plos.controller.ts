import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlosService } from './plos.service';
import { CreatePloDto } from '../../dto/plo/create-plo.dto';
import { UpdatePloDto } from '../../dto/plo/update-plo.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@ApiBearerAuth()
@Controller('plos')
export class PlosController {
  constructor(private readonly plosService: PlosService) {}

  @Post()
  create(@Body() createPloDto: CreatePloDto) {
    return this.plosService.create(createPloDto);
  }

  @Get()
  findAll() {
    return this.plosService.findAll();
  }

  @Get('/curriculumId/:curriculumId')
  findAllByCurriculum(@Param('curriculumId') curriculumId: number) {
    return this.plosService.findAllByCurriculum(curriculumId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePloDto: UpdatePloDto) {
    return this.plosService.update(+id, updatePloDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    try {
      return this.plosService.remove(id);
    } catch (error) {
      throw new ExceptionsHandler(error);
    }
  }
}
