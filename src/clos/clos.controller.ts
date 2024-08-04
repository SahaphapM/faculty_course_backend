import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ClosService } from './clos.service';
import { CreateCloDto } from './dto/create-clo.dto';
import { UpdateCloDto } from './dto/update-clo.dto';
import { PaginationDto } from 'src/users/dto/pagination.dto';

@Controller('clos')
export class ClosController {
  constructor(private readonly closService: ClosService) {}

  @Post()
  create(@Body() createCloDto: CreateCloDto) {
    return this.closService.create(createCloDto);
  }

  @Get('pages')
  findAllByPage(@Query() paginationDto: PaginationDto) {
    return this.closService.findAllByPage(paginationDto);
  }

  @Get()
  findAll() {
    return this.closService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.closService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCloDto: UpdateCloDto) {
    return this.closService.update(id, updateCloDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.closService.remove(id);
  }
}
