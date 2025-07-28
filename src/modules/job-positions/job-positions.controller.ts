import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JobPositionsService } from './job-positions.service';
import { CreateJobPositionDto } from 'src/generated/nestjs-dto/create-jobPosition.dto';
import { UpdateJobPositionDto } from 'src/generated/nestjs-dto/update-jobPosition.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { Query } from '@nestjs/common';

@Controller('job-positions')
export class JobPositionsController {
  constructor(private readonly jobPositionsService: JobPositionsService) {}

  @Post()
  create(@Body() createJobPositionDto: CreateJobPositionDto) {
    return this.jobPositionsService.create(createJobPositionDto);
  }

  @Get()
  findAll(@Query() filter: BaseFilterParams) {
    return this.jobPositionsService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobPositionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobPositionDto: UpdateJobPositionDto,
  ) {
    return this.jobPositionsService.update(+id, updateJobPositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobPositionsService.remove(+id);
  }
}
