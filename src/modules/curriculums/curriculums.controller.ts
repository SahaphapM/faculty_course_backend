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
import { CurriculumsService } from './curriculums.service';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateCurriculumDto } from 'src/generated/nestjs-dto/create-curriculum.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { CurriculumFilterDto } from 'src/dto/filters/filter.curriculum.dto';
import { SkillCollectionSummaryFilterDto } from 'src/dto/filters/filter.skill-collection-summary.dto';
import { Paginated } from 'src/dto/pagination.dto';
import { Curriculum } from 'src/generated/nestjs-dto/curriculum.entity';

const PaginatedCurriculumDto = Paginated(Curriculum);

@ApiBearerAuth()
@Controller('curriculums')
export class CurriculumsController {
  constructor(private readonly curriculumsService: CurriculumsService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  @ApiQuery({ name: 'coordinatorId', required: false })
  create(
    @Body() createCurriculumDto: CreateCurriculumDto,
    @Query('coordinatorId') coordinatorId?: number,
  ) {
    return this.curriculumsService.create(createCurriculumDto, coordinatorId);
  }

  @Get()
  @ApiOkResponse({type: PaginatedCurriculumDto})
  @ApiQuery({ name: 'coordinatorId', required: false })
  findAll(
    @Query() pag?: CurriculumFilterDto,
    @Query('coordinatorId') coordinatorId?: number,
  ) {
    return this.curriculumsService.findAll(pag, coordinatorId);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get('options')
  findAllOptions() {
    return this.curriculumsService.findOptions();
  }

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

  @Get(':code')
  findOneByCode(@Param('code') code: string) {
    return this.curriculumsService.findOneByCode(code);
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
  @Get('level-description/:curriculumCode')
  getAllLevelDescription(@Param('curriculumCode') curriculumCode: string) {
    return this.curriculumsService.getAllLevelDescription(curriculumCode);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curriculumsService.remove(+id);
  }

  @ApiQuery({
    name: 'yearCode',
    required: false,
  })
  @ApiQuery({
    name: 'targetLevel',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
  })
  @Get('filters/skill/:skillId/students')
  @ApiParam({ name: 'skillId', type: String, description: 'Skill ID' })
  async getStudentsBySkillLevel(
    @Param('skillId') skillId: number,
    @Query('targetLevel') targetLevel: 'on' | 'above' | 'below' | 'all',
    @Query('year') year: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string, // optional
  ) {
    return await this.curriculumsService.findStudentsBySkillLevel(
      skillId,
      targetLevel,
      year,
      page,
      limit,
      search,
    );
  }

  @Get('summary/skill-collection/:curriculumId')
  async getSkillCollectionSummaryByCurriculum(
    @Param('curriculumId') curriculumId: number,
    @Query() q: SkillCollectionSummaryFilterDto,
  ) {
    // ส่ง DTO ก้อนเดียวไปที่ service (ที่เราเขียนแบบรองรับ pagination แล้ว)
    return this.curriculumsService.getSkillCollectionSummaryByCurriculumPaginated(
      curriculumId,
      q,
    );
  }
}
