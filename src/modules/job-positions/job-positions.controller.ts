import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { JobPositionsService } from './job-positions.service';
import { CreateJobPositionDto } from 'src/generated/nestjs-dto/create-jobPosition.dto';
import { UpdateJobPositionDto } from 'src/generated/nestjs-dto/update-jobPosition.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('job-positions')
export class JobPositionsController {
  constructor(private readonly jobPositionsService: JobPositionsService) {}

  @Post()
  async create(@Body() createJobPositionDto: CreateJobPositionDto) {
    try {
      return await this.jobPositionsService.create(createJobPositionDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw error;
    }
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
  async update(
    @Param('id') id: string,
    @Body() updateJobPositionDto: UpdateJobPositionDto,
  ) {
    try {
      return await this.jobPositionsService.update(+id, updateJobPositionDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobPositionsService.remove(+id);
  }

  @Patch('update-position-company/:companyId')
  async updatePositionCompany(
    @Param('companyId') companyId: string,
    @Body() body: { positionIds: number[] },
  ) {
    return this.jobPositionsService.updateJobPositionsToCompany(
      Number(companyId),
      body.positionIds,
    );
  }
}
