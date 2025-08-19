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
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { CreateBranchDto } from 'src/generated/nestjs-dto/create-branch.dto';
import { UpdateBranchDto } from 'src/generated/nestjs-dto/update-branch.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { BranchFilterDto } from 'src/dto/filters/filter.branch.dto';
import { PaginatedBranchDto } from 'src/dto/pagination.types';

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
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort field, prefix with - for DESC (e.g. "-id")',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Override sort direction (asc|desc)',
  })
  @ApiQuery({
    name: 'thaiName',
    required: false,
    description: 'Filter by Thai name (contains)',
  })
  @ApiQuery({
    name: 'engName',
    required: false,
    description: 'Filter by English name (contains)',
  })
  @ApiExtraModels(BranchFilterDto)
  @ApiQuery({ name: 'pag', required: false, schema: { $ref: getSchemaPath(BranchFilterDto) }, description: 'Filter/query parameters' })
  @Get()
  @ApiOkResponse({ type: PaginatedBranchDto })
  findAll(@Query() pag?: BranchFilterDto) {
    return this.branchService.findAll(pag);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get('options')
  findAllOptions() {
    return this.branchService.findOptions();
  }

  @Roles(
    UserRole.Admin,
    UserRole.Coordinator,
    UserRole.Instructor,
    UserRole.Student,
  )
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
