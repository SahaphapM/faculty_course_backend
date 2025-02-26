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
import { UsersService } from './users.service';
import { FilterParams } from 'src/dto/filter-params.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from 'src/generated/nestjs-dto/create-user.dto';
import { UpdateUserDto } from 'src/generated/nestjs-dto/update-user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/enums/role.enum';
import { Public } from 'src/decorators/public.decorator';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // @Roles(UserRole.Admin)
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Roles(UserRole.Admin)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() pag?: FilterParams) {
    return this.usersService.findAll(pag);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
