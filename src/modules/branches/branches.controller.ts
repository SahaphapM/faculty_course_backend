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
import { ApiBearerAuth } from '@nestjs/swagger';
import { FilterParams } from 'src/dto/filter-params.dto';
import { CreateBranchDto } from 'src/generated/nestjs-dto/create-branch.dto';
import { UpdateBranchDto } from 'src/generated/nestjs-dto/update-branch.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';

@ApiBearerAuth()
@Roles(UserRole.Admin)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchService: BranchesService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Get()
  findAll(@Query() pag?: FilterParams) {
    return this.branchService.findAll(pag);
  }

  @Get('options')
  findAllOptions() {
    return this.branchService.findOptions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(+id, updateBranchDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchService.remove(+id);
  }

  @Get('filters/:facultyId')
  filters(@Query('facultyId') facultyId: string) {
    return this.branchService.filters(+facultyId);
  }
}
