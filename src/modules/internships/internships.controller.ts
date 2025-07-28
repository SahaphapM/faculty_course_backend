import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { InternshipService } from './internships.service';

@Controller('internships')
export class InternshipController {
  constructor(private readonly internshipService: InternshipService) {}

  @Post()
  async createInternship(@Body() data: any) {
    return this.internshipService.createInternship(data);
  }

  @Get()
  async getInternships() {
    return this.internshipService.getInternships();
  }

  @Get(':id')
  async getInternship(@Param('id') id: number) {
    return this.internshipService.getInternship(id);
  }

  @Put(':id')
  async updateInternship(@Param('id') id: number, @Body() data: any) {
    return this.internshipService.updateInternship(id, data);
  }

  @Delete(':id')
  async deleteInternship(@Param('id') id: number) {
    return this.internshipService.deleteInternship(id);
  }
}