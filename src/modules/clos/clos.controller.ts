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
import { ClosService } from './clos.service';
import { FilterParams } from 'src/dto/filter-params.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCloDto } from 'src/generated/nestjs-dto/create-clo.dto';
import { UpdateCloDto } from 'src/generated/nestjs-dto/update-clo.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@ApiBearerAuth()
@Controller('clos')
export class ClosController {
  constructor(private readonly closService: ClosService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Post()
  create(@Body() createCloDto: CreateCloDto) {
    return this.closService.create(createCloDto);
  }

  @Get()
  findAllByPage(@Query() paginationDto: FilterParams) {
    return this.closService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.closService.findOne(id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCloDto: UpdateCloDto) {
    return this.closService.update(id, updateCloDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.closService.remove(id);
  }
}
