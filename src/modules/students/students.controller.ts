import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiExtraModels, getSchemaPath, ApiOperation, ApiBody } from '@nestjs/swagger';
import { CreateStudentDto } from 'src/generated/nestjs-dto/create-student.dto';
import { UpdateStudentDto } from 'src/generated/nestjs-dto/update-student.dto';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { StudentFilterDto } from 'src/dto/filters/filter.student.dto';
import { Response } from 'express';
import axios from 'axios';
import { Public } from 'src/decorators/public.decorator';
import { PaginatedStudentDto } from 'src/dto/pagination.types';
import { UpdateGraduationDateDto } from './dto/update-graduation-date.dto';


@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles(
    UserRole.Admin,
    UserRole.Coordinator,
    UserRole.Instructor,
    UserRole.Student,
  )
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Post('import')
  importStudents(@Body() students: CreateStudentDto[]) {
    return this.studentsService.importStudents(students);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @ApiExtraModels(StudentFilterDto)
  @ApiQuery({ name: 'pag', required: false, schema: { $ref: getSchemaPath(StudentFilterDto) }, description: 'Filter/query parameters' })
  @Get('skill')
  @ApiOkResponse({type: PaginatedStudentDto})
  findAllBySkill(@Query() pag?: StudentFilterDto) {
    return this.studentsService.findAllBySkill(pag);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Get('code-year')
  @ApiQuery({ name: 'facultyId', required: false, type: Number })
  @ApiQuery({ name: 'branchId', required: false, type: Number })
  @ApiQuery({ name: 'curriculumCode', required: false })
  getExistYearFromCode(
    @Query('facultyId') facultyId?: number,
    @Query('branchId') branchId?: number,
    @Query('curriculumCode') curriculumCode?: string,
  ) {
    return this.studentsService.getExistYearFromCode(
      facultyId || 0,
      branchId || 0,
      curriculumCode,
    );
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @ApiExtraModels(StudentFilterDto)
  @ApiQuery({ name: 'pag', required: false, schema: { $ref: getSchemaPath(StudentFilterDto) }, description: 'Filter/query parameters' })
  @Get()
  @ApiOkResponse({type: PaginatedStudentDto})
  findAll(@Query() pag?: StudentFilterDto) {
    return this.studentsService.findAll(pag);
  }

  @Roles(UserRole.Admin)
  @Get('available-users')
  findAvailableStudentsForUser(@Query() query?: StudentFilterDto) {
    return this.studentsService.findAvailableStudentsForUser(query);
  }

  @Public()
  @Get('student-image/:id')
  async getStudentImage(@Param('id') id: string, @Res() res: Response) {
    try {
      const response = await axios.get(
        `https://reg.buu.ac.th/registrar/getstudentimage.asp?id=${id}`,
        { responseType: 'arraybuffer' },
      );

      res.set({
        'Content-Type': 'image/jpeg',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache',
      });

      res.send(response.data);
    } catch (error) {
      console.error('Error fetching student image:', error);
      throw new NotFoundException(`Image for student with ID ${id} not found`);
    }
  }
  @Public()
  @Get('student-image')
  optionsStudentImage(@Res() res: Response) {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.send();
  }

  @Get('missing-data')
  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  findMissingData(@Query() pag?: StudentFilterDto) {
    return this.studentsService.findMissingData(pag);
  }

  @Roles(
    UserRole.Admin,
    UserRole.Coordinator,
    UserRole.Instructor,
    UserRole.Student,
  )
  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.studentsService.findOne(code);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Patch('graduation-date/by-curriculum')
  @ApiOperation({ summary: 'Update graduationDate for all students in a curriculum' })
  @ApiBody({ type: UpdateGraduationDateDto })
  updateGraduationDateByCurriculum(@Body() dto: UpdateGraduationDateDto) {
    return this.studentsService.updateGraduationDateByCurriculum(dto);
  }

  @Roles(UserRole.Admin, UserRole.Coordinator, UserRole.Instructor)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
