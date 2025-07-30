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
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateBranchDto } from 'src/generated/nestjs-dto/create-branch.dto';
import { UpdateBranchDto } from 'src/generated/nestjs-dto/update-branch.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { BranchFilterDto } from 'src/dto/filters/filter.branch.dto';

@ApiBearerAuth()
@Roles(UserRole.Admin)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchService: BranchesService) {}

  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchService.create(createBranchDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get()
  findAll(@Query() pag?: BranchFilterDto) {
    return this.branchService.findAll(pag);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get('options')
  findAllOptions() {
    return this.branchService.findOptions();
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.branchService.update(+id, updateBranchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchService.remove(+id);
  }
}
