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
import { CurriculumsService } from './curriculums.service';
import { PaginationDto } from '../../dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCurriculumDto } from 'src/generated/nestjs-dto/create-curriculum.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';

@ApiBearerAuth()
@Controller('curriculums')
export class CurriculumsController {
  constructor(private readonly curriculumsService: CurriculumsService) {}

  @Post()
  create(@Body() createCurriculumDto: CreateCurriculumDto) {
    return this.curriculumsService.create(createCurriculumDto);
  }

  @Get()
  findAll(@Query() pag?: PaginationDto) {
    return this.curriculumsService.findAll(pag);
  }

  @Get(':code')
  findOneByCode(@Param('code') code: string) {
    return this.curriculumsService.findOneByCode(code);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ) {
    return this.curriculumsService.update(+id, updateCurriculumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curriculumsService.remove(+id);
  }

  @Get('filters/:branchId')
  async filters(@Query('branchId') branchId: string) {
    return this.curriculumsService.findWithFilters(+branchId);
  }
}
