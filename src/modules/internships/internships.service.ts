import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { UpdateInternshipStatusDto } from './dto/update-internship-status.dto';
import { InternshipFilterDto } from './dto/internship-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InternshipService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new internship
   */
  async createInternship(createInternshipDto: CreateInternshipDto) {
    try {
      // Validate that student exists
      const student = await this.prisma.student.findUnique({
        where: { id: createInternshipDto.studentId }
      });
      
      if (!student) {
        throw new NotFoundException(`Student with ID ${createInternshipDto.studentId} not found`);
      }
      
      // Validate that company exists
      const company = await this.prisma.company.findUnique({
        where: { id: createInternshipDto.companyId }
      });
      
      if (!company) {
        throw new NotFoundException(`Company with ID ${createInternshipDto.companyId} not found`);
      }
      
      // Validate dates
      const startDate = new Date(createInternshipDto.startDate);
      const endDate = new Date(createInternshipDto.endDate);
      
      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
      
      return this.prisma.internship.create({
        data: createInternshipDto,
        include: {
          student: true,
          company: true
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new ConflictException('Failed to create internship', error.message);
    }
  }

  /**
   * Get all internships with filtering and pagination
   */
  async getInternships(filterDto: InternshipFilterDto) {
    const {
      limit = 10,
      page = 1,
      orderBy = 'asc',
      sort = 'id',
      studentId,
      companyId,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      status
    } = filterDto;

    // Build where conditions based on filters
    const where: Prisma.InternshipWhereInput = {};
    
    if (studentId) {
      where.studentId = studentId;
    }
    
    if (companyId) {
      where.companyId = companyId;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Date range filters
    if (startDateFrom || startDateTo) {
      where.startDate = {};
      
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom);
      }
      
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo);
      }
    }
    
    if (endDateFrom || endDateTo) {
      where.endDate = {};
      
      if (endDateFrom) {
        where.endDate.gte = new Date(endDateFrom);
      }
      
      if (endDateTo) {
        where.endDate.lte = new Date(endDateTo);
      }
    }

    // Query options with pagination
    const options: Prisma.InternshipFindManyArgs = {
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sort]: orderBy },
      include: {
        student: true,
        company: true
      }
    };

    // Execute query and count total
    const [internships, total] = await Promise.all([
      this.prisma.internship.findMany(options),
      this.prisma.internship.count({ where })
    ]);

    return {
      data: internships,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a specific internship by ID
   */
  async getInternship(id: number) {
    const internship = await this.prisma.internship.findUnique({
      where: { id },
      include: {
        student: true,
        company: true
      }
    });
    
    if (!internship) {
      throw new NotFoundException(`Internship with ID ${id} not found`);
    }
    
    return internship;
  }

  /**
   * Update an internship
   */
  async updateInternship(id: number, updateInternshipDto: UpdateInternshipDto) {
    try {
      // Check if internship exists
      const existingInternship = await this.prisma.internship.findUnique({
        where: { id }
      });
      
      if (!existingInternship) {
        throw new NotFoundException(`Internship with ID ${id} not found`);
      }
      
      // Validate student if provided
      if (updateInternshipDto.studentId) {
        const student = await this.prisma.student.findUnique({
          where: { id: updateInternshipDto.studentId }
        });
        
        if (!student) {
          throw new NotFoundException(`Student with ID ${updateInternshipDto.studentId} not found`);
        }
      }
      
      // Validate company if provided
      if (updateInternshipDto.companyId) {
        const company = await this.prisma.company.findUnique({
          where: { id: updateInternshipDto.companyId }
        });
        
        if (!company) {
          throw new NotFoundException(`Company with ID ${updateInternshipDto.companyId} not found`);
        }
      }
      
      // Validate dates if both are provided
      if (updateInternshipDto.startDate && updateInternshipDto.endDate) {
        const startDate = new Date(updateInternshipDto.startDate);
        const endDate = new Date(updateInternshipDto.endDate);
        
        if (startDate >= endDate) {
          throw new BadRequestException('Start date must be before end date');
        }
      } else if (updateInternshipDto.startDate && !updateInternshipDto.endDate) {
        // If only start date is provided, check against existing end date
        const startDate = new Date(updateInternshipDto.startDate);
        const endDate = existingInternship.endDate;
        
        if (startDate >= endDate) {
          throw new BadRequestException('Start date must be before end date');
        }
      } else if (!updateInternshipDto.startDate && updateInternshipDto.endDate) {
        // If only end date is provided, check against existing start date
        const startDate = existingInternship.startDate;
        const endDate = new Date(updateInternshipDto.endDate);
        
        if (startDate >= endDate) {
          throw new BadRequestException('Start date must be before end date');
        }
      }
      
      return this.prisma.internship.update({
        where: { id },
        data: updateInternshipDto,
        include: {
          student: true,
          company: true
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new ConflictException('Failed to update internship', error.message);
    }
  }

  /**
   * Update just the status of an internship
   */
  async updateInternshipStatus(id: number, updateStatusDto: UpdateInternshipStatusDto) {
    const existingInternship = await this.prisma.internship.findUnique({
      where: { id }
    });
    
    if (!existingInternship) {
      throw new NotFoundException(`Internship with ID ${id} not found`);
    }
    
    return this.prisma.internship.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: {
        student: true,
        company: true
      }
    });
  }

  /**
   * Delete an internship
   */
  async deleteInternship(id: number) {
    const existingInternship = await this.prisma.internship.findUnique({
      where: { id }
    });
    
    if (!existingInternship) {
      throw new NotFoundException(`Internship with ID ${id} not found`);
    }
    
    return this.prisma.internship.delete({ where: { id } });
  }

  /**
   * Get all internships for a specific student
   */
  async getStudentInternships(studentId: number, filterDto: InternshipFilterDto) {
    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId }
    });
    
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    
    // Set the studentId in the filter
    filterDto.studentId = studentId;
    
    // Use the existing getInternships method with the updated filter
    return this.getInternships(filterDto);
  }

  /**
   * Get all internships at a specific company
   */
  async getCompanyInternships(companyId: number, filterDto: InternshipFilterDto) {
    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId }
    });
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }
    
    // Set the companyId in the filter
    filterDto.companyId = companyId;
    
    // Use the existing getInternships method with the updated filter
    return this.getInternships(filterDto);
  }
}