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
import { ClosService } from './clos.service';
import { FilterParams } from 'src/dto/filter-params.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCloDto } from 'src/generated/nestjs-dto/create-clo.dto';
import { UpdateCloDto } from 'src/generated/nestjs-dto/update-clo.dto';

@ApiBearerAuth()
@Controller('clos')
export class ClosController {
  constructor(private readonly closService: ClosService) {}

  @Post()
  create(@Body() createCloDto: CreateCloDto) {
    return this.closService.create(createCloDto);
  }

  @Get('pages')
  findAllByPage(@Query() paginationDto: FilterParams) {
    return this.closService.findAllByPage(paginationDto);
  }

  @Get()
  findAll() {
    return this.closService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.closService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCloDto: UpdateCloDto) {
    return this.closService.update(id, updateCloDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.closService.remove(id);
  }
}
