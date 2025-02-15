import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  Res,
} from '@nestjs/common';
import { ClosService } from './clos.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
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
  findAllByPage(@Query() paginationDto: PaginationDto) {
    return this.closService.findAllByPage(paginationDto);
  }

  @Get()
  findAll() {
    return this.closService.findAll();
  }

  // @Get('coursSpecId/:coursSpecId')
  // findAllByCoursSpec(@Param('coursSpecId') id: number) {
  //   return this.closService.findAllByCourseSpec(id);
  // }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.closService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCloDto: UpdateCloDto) {
    return this.closService.update(id, updateCloDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number, @Res() res: Response) {
    try {
      await this.closService.remove(id);
      return res.status(204).send();
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Internal Server Error';
      return res.status(status).json({
        statusCode: status,
        message,
      });
    }
  }
}
