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

@ApiBearerAuth()
@Controller('plos')
export class PlosController {
  constructor(private readonly plosService: PloService) {}

  @Post()
  create(@Body() createPloDto: CreatePloDto) {
    return this.plosService.create(createPloDto);
  }

  @Get()
  findAll() {
    return this.plosService.findAll();
  }

  @Get('filters/:curriculumId')
  findAllByCurriculum(@Query('curriculumId') curriculumId: string) {
    return this.plosService.findAllByCurriculum(+curriculumId);
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
  remove(@Param('id') id: string) {
    return this.plosService.remove(+id);
  }
}
