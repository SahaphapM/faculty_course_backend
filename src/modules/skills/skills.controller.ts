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
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { CreateSkillDto } from 'src/generated/nestjs-dto/create-skill.dto';
import { UpdateSkillDto } from 'src/generated/nestjs-dto/update-skill.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { SkillFilterDto } from 'src/dto/filters/filter.skill.dto';
import { Paginated } from 'src/dto/pagination.dto';
import { Skill } from 'src/generated/nestjs-dto/skill.entity';

const PaginatedSkillDto = Paginated(Skill);

@ApiBearerAuth()
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOkResponse({type: PaginatedSkillDto})
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
    description: 'Sort field, prefix with - for DESC (e.g. -id)',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: 'Explicit sort direction (asc|desc) overrides sort prefix',
  })
  @ApiQuery({
    name: 'nameCode',
    required: false,
    description: 'Filter by Thai/English name (contains)',
  })
  @ApiQuery({
    name: 'domain',
    required: false,
    description: 'Filter by skill domain',
  })
  @ApiQuery({
    name: 'curriculumId',
    required: false,
    type: Number,
    description: 'Filter root skills by curriculum',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    type: Number,
    description: 'Filter root skills by branch',
  })
  @ApiQuery({
    name: 'facultyId',
    required: false,
    type: Number,
    description: 'Filter root skills by faculty',
  })
  @ApiQuery({
    name: 'subjectId',
    required: false,
    type: Number,
    description:
      'Filter root skills by subject (derives skills from related CLOs)',
  })
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
