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
import { InternshipsService } from './internships.service';
import { CreateInternshipWithStudentDto } from './dto/create.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Post()
  create(@Body() createInternshipDto: CreateInternshipWithStudentDto) {
    return this.internshipsService.create(createInternshipDto);
  }

  @Get()
  // set name for this api swagger
  @ApiOperation({
    summary: 'ดึง internship ทั้งหมด',
  })
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
    name: 'search',
    required: false,
    description: 'Search term to filter company name (contains)',
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
    name: 'year',
    required: false,
    type: Number,
    description: 'Filter by internship year',
  })
  findAll(@Query() pag?: BaseFilterParams, @Query('year') year?: number) {
    return this.internshipsService.findAllPagination(pag, year);
  }

  @Get(':id')
  // set name for this api swagger
  @ApiOperation({
    summary: 'ดึง internship ด้วย id',
  })
  findOne(@Param('id') id: string) {
    return this.internshipsService.findOne(+id);
  }

  @Patch(':id')
  // set name for this api swagger
  @ApiOperation({
    summary: 'แก้ไขการฝึกงาน เพิ่มลบนิสิต พร้อมตำแหน่งงาน',
  })
  update(
    @Param('id') id: string,
    @Body() updateInternshipDto: CreateInternshipWithStudentDto,
  ) {
    return this.internshipsService.update(+id, updateInternshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.internshipsService.remove(+id);
  }

  /////// company ///////
  @Get('company/:token')
  // set name for this api swagger
  @ApiOperation({
    summary: 'สถานประกอบการดึง internship ด้วย token',
  })
  findOneByToken(@Param('token') token: string) {
    return this.internshipsService.findOneByToken(token);
  }

  @Get('company/:token/:studentCode')
  @ApiOperation({
    summary: 'สถานประกอบการใช้ในการดึง Skill Assessment ของนิสิตคนนั้นๆ',
  })
  getAssessmentByStudent(
    @Param('token') token: string,
    @Param('studentCode') studentCode: string,
  ) {
    return this.internshipsService.getAssessmentByStudent(token, studentCode);
  }
}
