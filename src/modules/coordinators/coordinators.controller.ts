import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CoordinatorsService } from './coordinators.service';
import { ApiBearerAuth, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { CreateCoordinatorDto } from 'src/generated/nestjs-dto/create-coordinator.dto';
import { UpdateCoordinatorDto } from 'src/generated/nestjs-dto/update-coordinator.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { CoordinatorFilterDto } from 'src/dto/filters/filter.coordinator.dto';
import { CoordinatorIds } from './dto/coordinator.dto';
import { Paginated } from 'src/dto/pagination.dto';
import { Coordinator } from 'src/generated/nestjs-dto/coordinator.entity';

const PaginatedCoordinatorDto = Paginated(Coordinator);

@ApiBearerAuth()
@Controller('coordinators')
export class CoordinatorsController {
  constructor(private readonly coordinatorsService: CoordinatorsService) {}

  @Roles(UserRole.Admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCoordinatorDto: CreateCoordinatorDto) {
    return this.coordinatorsService.create(createCoordinatorDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Get()
  @ApiOkResponse({type: PaginatedCoordinatorDto})
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pag?: CoordinatorFilterDto) {
    return this.coordinatorsService.findAll(pag);
  }

  @Roles(UserRole.Admin)
  @Get('available-users')
  findAvailableCoordinatorsForUser(@Query() query?: CoordinatorFilterDto) {
    return this.coordinatorsService.findAvailableCoordinatorsForUser(query);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.coordinatorsService.findOne(+id);
  }

  @Roles(UserRole.Admin)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateCoordinatorDto: UpdateCoordinatorDto,
  ) {
    return this.coordinatorsService.update(+id, updateCoordinatorDto);
  }

  @Roles(UserRole.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.coordinatorsService.remove(+id);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator)
  @Post('assign-coordinator')
  @ApiBody({ type: CoordinatorIds })
  @HttpCode(HttpStatus.OK)
  selectInstructorToCurriculum(
    @Query('curriculumId') curriculumId: string,
    @Body() coordinatorIds: CoordinatorIds,
  ) {
    return this.coordinatorsService.updateCoordinatorToCurriculum(
      coordinatorIds.coordinatorIds,
      +curriculumId,
    );
  }
}
