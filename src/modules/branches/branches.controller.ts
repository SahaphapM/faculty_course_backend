import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from '../../dto/branch/create-branch.dto';
import { UpdateBranchDto } from '../../dto/branch/update-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchService: BranchesService) {}

  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  findAll() {
    return this.branchService.findAll();
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
}
