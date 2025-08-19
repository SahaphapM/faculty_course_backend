import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './users.service';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';
import { UpdateUserDto } from 'src/generated/nestjs-dto/update-user.dto';
import { UpdateUserStudentDto } from 'src/dto/update-user-student.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { UserFilterDto } from 'src/dto/filters/filter.user.dto';
import { Paginated } from 'src/dto/pagination.dto';
import { User } from 'src/generated/nestjs-dto/user.entity';

const PaginatedUserDto = Paginated(User);

@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserService) {}
  @Roles(UserRole.Admin)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Roles(UserRole.Admin)
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
    name: 'email',
    required: false,
    description: 'Filter by user email (contains)',
  })
  @Get()
  @ApiOkResponse({type: PaginatedUserDto})
  findAll(@Query() pag?: UserFilterDto) {
    return this.usersService.findAll(pag);
  }

  @Roles(UserRole.Admin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(+id);
  }

  @Roles(UserRole.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Roles(UserRole.Admin)
  @Patch(':id/student')
  updateStudentId(@Param('id') id: string, @Body() updateUserStudentDto: UpdateUserStudentDto) {
    return this.usersService.updateStudentId(+id, updateUserStudentDto);
  }

  @Roles(UserRole.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
