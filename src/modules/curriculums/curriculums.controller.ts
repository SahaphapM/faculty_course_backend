import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurriculumsService } from './curriculums.service';
import { CoordinatorCurriculumsService } from './coordinator-curriculums.service';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiQuery, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { CreateCurriculumDto } from 'src/generated/nestjs-dto/create-curriculum.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { CurriculumFilterDto } from 'src/dto/filters/filter.curriculum.dto';
import { SkillCollectionSummaryFilterDto } from 'src/dto/filters/filter.skill-collection.dto';
import { StudentsBySkillLevelFilterDto } from 'src/dto/filters/filter.students-by-skill-level.dto';
import { PaginatedCurriculumDto } from 'src/dto/pagination.types';
import { CurriculumAccess } from 'src/decorators/curriculum-access.decorator';
import { CurriculumAccessGuard } from 'src/auth/guard/curriculum-access.guard';

@ApiBearerAuth()
@Controller('curriculums')
export class CurriculumsController {
  constructor(
    private readonly curriculumsService: CurriculumsService,
    private readonly coordinatorCurriculumsService: CoordinatorCurriculumsService,
  ) {}

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  @ApiQuery({ name: 'coordinatorId', required: false })
  create(
    @Body() createCurriculumDto: CreateCurriculumDto,
    @Query('coordinatorId') coordinatorId?: number,
  ) {
    return this.curriculumsService.create(createCurriculumDto, coordinatorId);
  }

  @ApiExtraModels(CurriculumFilterDto)
  @ApiQuery({ name: 'pag', required: false, schema: { $ref: getSchemaPath(CurriculumFilterDto) }, description: 'Filter/query parameters' })
  @Get()
  @ApiOkResponse({type: PaginatedCurriculumDto})
  findAll(
    @Query() pag?: CurriculumFilterDto,
    @Req() req?: any,
  ) {
    const currentUser = req?.user;
    
    // If user is a coordinator, use the specialized service
    if (currentUser?.role === UserRole.Coordinator) {
      return this.coordinatorCurriculumsService.findAllForCoordinator(currentUser.id, pag);
    }
    
    // For admins and other roles, use the regular service
    return this.curriculumsService.findAll(pag);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get('options')
  findAllOptions(@Req() req?: any) {
    const currentUser = req?.user;
    
    // If user is a coordinator, use the specialized service
    if (currentUser?.role === UserRole.Coordinator) {
      return this.coordinatorCurriculumsService.findOptionsForCoordinator(currentUser.id);
    }
    
    // For admins and other roles, use the regular service
    return this.curriculumsService.findOptions();
  }

  @UseGuards(CurriculumAccessGuard)
  @CurriculumAccess({ paramName: 'curriculumId', paramType: 'id' })
  @Get('summary/:curriculumId')
  async getSkillSummaryByCurriculum(
    @Param('curriculumId') curriculumId: number,
    @Query('yearCode') yearCode: string,
    @Query('skillType') skillType: string,
  ) {
    return this.curriculumsService.getSkillSummaryByCurriculum(
      curriculumId,
      yearCode,
      skillType,
    );
  }

  @UseGuards(CurriculumAccessGuard)
  @CurriculumAccess({ paramName: 'code', paramType: 'code' })
  @Get(':code')
  findOneByCode(@Param('code') code: string) {
    return this.curriculumsService.findOneByCode(code);
  }

  @UseGuards(CurriculumAccessGuard)
  @CurriculumAccess({ paramName: 'id', paramType: 'id' })
  @Get('id/:id')
  findOne(@Param('id') id: string) {
    return this.curriculumsService.findOne(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch('skillLevel/descriptions') // เส้นทางคงที่
  updateLevelDescriptions(
    @Body() body: { levelDescription: { id: number; description: string }[] },
  ) {
    console.dir(body, { depth: 3 });
    return this.curriculumsService.updateLevelDescriptions(
      body.levelDescription,
    );
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ) {
    return this.curriculumsService.update(+id, updateCurriculumDto);
  }

  // get all level description
  @UseGuards(CurriculumAccessGuard)
  @CurriculumAccess({ paramName: 'curriculumCode', paramType: 'code' })
  @Get('levels/:curriculumCode')
  getAllLevelDescription(@Param('curriculumCode') curriculumCode: string) {
    return this.curriculumsService.getAllLevelDescription(curriculumCode);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curriculumsService.remove(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.curriculumsService.restore(+id);
  }

  @Roles(UserRole.Admin)
  @ApiExtraModels(CurriculumFilterDto)
  @ApiQuery({ name: 'pag', required: false, schema: { $ref: getSchemaPath(CurriculumFilterDto) }, description: 'Filter/query parameters' })
  @Get('admin/all')
  @ApiOkResponse({type: PaginatedCurriculumDto})
  findAllIncludeInactive(
    @Query() pag?: CurriculumFilterDto,
  ) {
    return this.curriculumsService.findAllIncludeInactive(pag);
  }

  @ApiExtraModels(StudentsBySkillLevelFilterDto)
  @ApiQuery({ name: 'filter', required: false, schema: { $ref: getSchemaPath(StudentsBySkillLevelFilterDto) }, description: 'Filter/query parameters' })
  @Get('filters/skill/:skillId/students')
  @ApiParam({ name: 'skillId', type: String, description: 'Skill ID' })
  async getStudentsBySkillLevel(
    @Param('skillId') skillId: number,
    @Query() filter: StudentsBySkillLevelFilterDto,
  ) {
    return await this.curriculumsService.findStudentsBySkillLevel(
      skillId,
      filter.targetLevel,
      filter.year || filter.yearCode,
      filter.page || 1,
      filter.limit || 10,
      filter.search,
    );
  }

  @UseGuards(CurriculumAccessGuard)
  @CurriculumAccess({ paramName: 'curriculumId', paramType: 'id' })
  @ApiExtraModels(SkillCollectionSummaryFilterDto)
  @ApiQuery({ name: 'q', required: false, schema: { $ref: getSchemaPath(SkillCollectionSummaryFilterDto) }, description: 'Filter/query parameters' })
  @Get('summary/skill-collection/:curriculumId')
  async getSkillCollectionSummaryByCurriculum(
    @Param('curriculumId') curriculumId: number,
    @Query() q: SkillCollectionSummaryFilterDto,
  ) {
    return this.curriculumsService.getSkillCollectionSummaryByCurriculumPaginated(
      curriculumId,
      q,
    );
  }
}
