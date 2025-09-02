import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { LevelDescriptionsService } from './level-descriptions.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { CurriculumAccess } from 'src/decorators/curriculum-access.decorator';
import { CurriculumAccessGuard } from 'src/auth/guard/curriculum-access.guard';
import { LevelDescription } from 'src/generated/nestjs-dto/levelDescription.entity';

@ApiBearerAuth()
@Controller('level-descriptions')
export class LevelDescriptionsController {
  constructor(private readonly levelDescriptionsService: LevelDescriptionsService) {}

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Patch('descriptions')
  updateLevelDescriptions(
    @Body() body: { levelDescription: Partial<LevelDescription>[] },
  ) {
    console.dir(body, { depth: 3 });
    return this.levelDescriptionsService.updateLevelDescriptions(
      body.levelDescription,
    );
  }

  @UseGuards(CurriculumAccessGuard)
  @CurriculumAccess({ paramName: 'curriculumCode', paramType: 'code' })
  @Get(':curriculumCode')
  getAllLevelDescription(@Param('curriculumCode') curriculumCode: string) {
    return this.levelDescriptionsService.getAllLevelDescription(curriculumCode);
  }
}
