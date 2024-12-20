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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from '../../dto/branch/create-branch.dto';
import { UpdateBranchDto } from '../../dto/branch/update-branch.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDto } from 'src/dto/pagination.dto';

@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchService: BranchesService) { }

  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  findAll(@Query() pag?: PaginationDto) {
    return this.branchService.findAll(pag);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }

  @Get('filters/:facultyId')
  filters(@Param('facultyId') facultyId: string) {
    return this.branchService.filters(facultyId);
  }
}
