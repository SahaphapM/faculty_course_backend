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
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateCurriculumDto } from 'src/generated/nestjs-dto/create-curriculum.dto';
import { UpdateCurriculumDto } from 'src/generated/nestjs-dto/update-curriculum.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { CurriculumFilterDto } from 'src/dto/filters/filter.curriculum.dto';

@ApiBearerAuth()
@Controller('curriculums')
export class CurriculumsController {
  constructor(private readonly curriculumsService: CurriculumsService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post()
  create(@Body() createCurriculumDto: CreateCurriculumDto) {
    return this.curriculumsService.create(createCurriculumDto);
  }

  @Get()
  findAll(@Query() pag?: CurriculumFilterDto) {
    return this.curriculumsService.findAll(pag);
  }

  @Get('summary:curriculumId')
  async getSkillSummaryByCurriculum(
    @Param('curriculumId') curriculumId: string,
    @Query('year') year?: number,
    @Query('skillType') skillType?: string,
  ) {
    return this.curriculumsService.getSkillSummaryByCurriculum(
      +curriculumId,
      year,
      skillType,
    );
  }

  @Get(':code')
  findOneByCode(@Param('code') code: string) {
    return this.curriculumsService.findOneByCode(code);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ) {
    return this.curriculumsService.update(+id, updateCurriculumDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.curriculumsService.remove(+id);
  }

  @Get('filters/:branchId')
  async filters(@Query('branchId') branchId: string) {
    return this.curriculumsService.findWithFilters(+branchId);
  }
}
