import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlosService } from './plos.service';
import { CreatePloDto } from './dto/create-plo.dto';
import { UpdatePloDto } from './dto/update-plo.dto';

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
