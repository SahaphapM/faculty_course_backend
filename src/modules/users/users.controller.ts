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
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';
import { UpdateUserDto } from 'src/generated/nestjs-dto/update-user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { UserFilterDto } from 'src/dto/filters/filter.user.dto';

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
  @Get()
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
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
