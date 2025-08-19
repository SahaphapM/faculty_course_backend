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
import { CompaniesService } from './companies.service';
import { CreateCompanyWithJobPositionsDto } from './dto/create-company-with-job.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { PaginatedCompanyDto } from 'src/dto/pagination.types';

@Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @ApiBearerAuth()
  @Post()
  create(@Body() createCompanyDto: CreateCompanyWithJobPositionsDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @ApiBearerAuth()
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
    name: 'search',
    required: false,
    description: 'Search term to match name / tel / email',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort field, prefix with - for DESC (e.g. -id)',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Explicit sort direction (asc|desc) overrides sort prefix',
  })
  @ApiExtraModels(BaseFilterParams)
  @ApiQuery({ name: 'filter', required: false, schema: { $ref: getSchemaPath(BaseFilterParams) }, description: 'Filter/query parameters' })
  @Get()
  @ApiOkResponse({type: PaginatedCompanyDto})
  findAll(@Query() filter: BaseFilterParams) {
    return this.companiesService.findAll(filter);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: CreateCompanyWithJobPositionsDto,
  ) {
    return this.companiesService.update(+id, updateCompanyDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(+id);
  }
}
