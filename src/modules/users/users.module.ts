import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Instructor } from 'src/entities/instructor.entity';
import { Student } from 'src/entities/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Instructor, Student])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
