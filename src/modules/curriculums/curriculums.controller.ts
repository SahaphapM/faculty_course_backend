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
import { CreateCurriculumDto } from '../../dto/curriculum/create-curriculum.dto';
import { UpdateCurriculumDto } from '../../dto/curriculum/update-curriculum.dto';
import { PaginationDto } from '../../dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

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

  @Patch(':code')
  update(@Body() updateCurriculumDto: UpdateCurriculumDto) {
    return this.curriculumsService.update(updateCurriculumDto);
  }

  @Delete(':code')
  remove(@Param('code') code: string) {
    return this.curriculumsService.remove(code);
  }

  @Get('filters/:branchId')
  async filters(@Param('branchId') branchId: string) {
    return this.curriculumsService.filters(branchId);
  }
}
