import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { CreateSkillDto } from 'src/generated/nestjs-dto/create-skill.dto';
import { UpdateSkillDto } from 'src/generated/nestjs-dto/update-skill.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SkillFilterDto } from 'src/dto/filters/filter.skill.dto';
import { PaginatedSkillDto } from 'src/dto/pagination.types';

@ApiBearerAuth()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @ApiExtraModels(SkillFilterDto)
  @ApiQuery({ name: 'pag', required: false, schema: { $ref: getSchemaPath(SkillFilterDto) }, description: 'Filter/query parameters' })
  @Get()
  @ApiOkResponse({type: PaginatedSkillDto})
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pag?: SkillFilterDto) {
    if (pag?.curriculumId) {
      return this.skillsService.findByCurriculum(pag.curriculumId, pag);
    }
    if (pag?.branchId) {
      return this.skillsService.findByBranch(pag.branchId, pag);
    }
    if (pag?.facultyId) {
      return this.skillsService.findByFaculty(pag.facultyId, pag);
    }
    if (pag?.subjectId) {
      return this.skillsService.findBySubject(pag.subjectId, pag);
    }

    return this.skillsService.findAll(pag);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: number) {
    return this.skillsService.findOne(id);
  }

  @Get('options/:curriculumId')
  findOptions(@Param('curriculumId') curriculumId: number) {
    return this.skillsService.findOptions(curriculumId);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: number, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.skillsService.remove(id);
  }
}
