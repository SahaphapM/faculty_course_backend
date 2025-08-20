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
import { PloService } from './plos.service';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { CreatePloDto } from 'src/generated/nestjs-dto/create-plo.dto';
import { UpdatePloDto } from 'src/generated/nestjs-dto/update-plo.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { PloFilterDto } from 'src/dto/filters/filter.plo.dto';
import { PaginatedPloDto } from 'src/dto/pagination.types';

@ApiBearerAuth()
@Controller('plos')
export class PlosController {
  constructor(private readonly plosService: PloService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Post()
  create(@Body() createPloDto: CreatePloDto) {
    return this.plosService.create(createPloDto);
  }

  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description: 'Sort field (prefix with - for descending). Example: "name" or "-createdAt"',
    example: 'id',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort direction (asc or desc)',
    example: 'asc',
  })
  @ApiQuery({
    name: 'curriculumCode',
    required: false,
    description: 'Filter PLOs by curriculum code',
  })
  @ApiExtraModels(PloFilterDto)
  @ApiQuery({ name: 'pag', required: false, schema: { $ref: getSchemaPath(PloFilterDto) }, description: 'Filter/query parameters' })
  @Get()
  @ApiOkResponse({type: PaginatedPloDto})
  findAll(@Query() filter?: PloFilterDto) {
    return this.plosService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plosService.findOne(+id);
  }


  @Get('options/:curriculumId')
  findOptions(@Param('curriculumId') curriculumId: number) {
    return this.plosService.findOptions(curriculumId);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePloDto: UpdatePloDto) {
    return this.plosService.update(+id, updatePloDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plosService.remove(+id);
  }
}
