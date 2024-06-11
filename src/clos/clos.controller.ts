import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClosService } from './clos.service';
import { CreateCloDto } from './dto/create-clo.dto';
import { UpdateCloDto } from './dto/update-clo.dto';

@Controller('clos')
export class ClosController {
  constructor(private readonly closService: ClosService) {}

  @Post()
  create(@Body() createCloDto: CreateCloDto) {
    return this.closService.create(createCloDto);
  }

  @Get()
  findAll() {
    return this.closService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.closService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCloDto: UpdateCloDto) {
    return this.closService.update(+id, updateCloDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.closService.remove(+id);
  }
}
