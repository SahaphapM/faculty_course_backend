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
import { CreateInternshipWithStudentDto } from './dto/create-internship-with-student.dto';
import { BaseFilterParams } from 'src/dto/filters/filter.base.dto';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Paginated } from 'src/dto/pagination.dto';
import { Internship } from 'src/generated/nestjs-dto/internship.entity';

const PaginatedInternshipDto = Paginated(Internship);

@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Post()
  create(@Body() createInternshipDto: CreateInternshipWithStudentDto) {
    return this.internshipsService.create(createInternshipDto);
  }

  @Get()
  @ApiOkResponse({type: PaginatedInternshipDto})
  @ApiQuery({
    name: 'year',
    required: false,
    type: String,
    description: 'Filter by internship year',
  })
  findAll(@Query() pag?: BaseFilterParams, @Query('year') year?: string) {
    return this.internshipsService.findAllPagination(pag, year);
  }

  @Get('get-years')
  @ApiOperation({
    summary: 'สถานประกอบการดึง internship ด้วย year',
  })
  getInternshipYear() {
    return this.internshipsService.getInternshipYear();
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
