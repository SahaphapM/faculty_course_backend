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
import { CreateCompanyWithJobPositionsDto } from './dto/create.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';

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
  @Get()
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
