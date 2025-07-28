import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { InternshipService } from './internships.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { UpdateInternshipStatusDto } from './dto/update-internship-status.dto';
import { InternshipFilterDto } from './dto/internship-filter.dto';

@ApiTags('internships')
@ApiBearerAuth()
@Controller('internships')
export class InternshipController {
  constructor(private readonly internshipService: InternshipService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new internship' })
  @ApiResponse({ status: 201, description: 'The internship has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Student or company not found.' })
  @ApiResponse({ status: 409, description: 'Conflict occurred while creating internship.' })
  async createInternship(@Body() createInternshipDto: CreateInternshipDto) {
    return this.internshipService.createInternship(createInternshipDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all internships with filtering options' })
  @ApiResponse({ status: 200, description: 'Return all internships matching the filter criteria.' })
  async getInternships(@Query() filterDto: InternshipFilterDto) {
    return this.internshipService.getInternships(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific internship by ID' })
  @ApiParam({ name: 'id', description: 'Internship ID' })
  @ApiResponse({ status: 200, description: 'Return the internship.' })
  @ApiResponse({ status: 404, description: 'Internship not found.' })
  async getInternship(@Param('id', ParseIntPipe) id: number) {
    return this.internshipService.getInternship(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an internship' })
  @ApiParam({ name: 'id', description: 'Internship ID' })
  @ApiResponse({ status: 200, description: 'The internship has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Internship, student, or company not found.' })
  @ApiResponse({ status: 409, description: 'Conflict occurred while updating internship.' })
  async updateInternship(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInternshipDto: UpdateInternshipDto
  ) {
    return this.internshipService.updateInternship(id, updateInternshipDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update just the status of an internship' })
  @ApiParam({ name: 'id', description: 'Internship ID' })
  @ApiResponse({ status: 200, description: 'The internship status has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Internship not found.' })
  async updateInternshipStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateInternshipStatusDto
  ) {
    return this.internshipService.updateInternshipStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an internship' })
  @ApiParam({ name: 'id', description: 'Internship ID' })
  @ApiResponse({ status: 204, description: 'The internship has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Internship not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInternship(@Param('id', ParseIntPipe) id: number) {
    await this.internshipService.deleteInternship(id);
  }

  @Get('students/:studentId')
  @ApiOperation({ summary: 'Get all internships for a specific student' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Return all internships for the student.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async getStudentInternships(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query() filterDto: InternshipFilterDto
  ) {
    return this.internshipService.getStudentInternships(studentId, filterDto);
  }

  @Get('companies/:companyId')
  @ApiOperation({ summary: 'Get all internships at a specific company' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Return all internships at the company.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async getCompanyInternships(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query() filterDto: InternshipFilterDto
  ) {
    return this.internshipService.getCompanyInternships(companyId, filterDto);
  }
}