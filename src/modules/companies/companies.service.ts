import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyFilterDto } from './dto/company-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new company
   */
  async create(createCompanyDto: CreateCompanyDto) {
    try {
      return await this.prisma.company.create({
        data: createCompanyDto
      });
    } catch (error) {
      throw new ConflictException('Failed to create company', error.message);
    }
  }

  /**
   * Get all companies with filtering and pagination
   */
  async findAll(filterDto: CompanyFilterDto) {
    const {
      limit = 10,
      page = 1,
      orderBy = 'asc',
      sort = 'id',
      name,
      address
    } = filterDto;

    // Build where conditions based on filters
    const where: Prisma.companyWhereInput = {};
    
    if (name) {
      where.name = {
        contains: name
      };
    }
    
    if (address) {
      where.address = {
        contains: address
      };
    }

    // Query options with pagination
    const options: Prisma.companyFindManyArgs = {
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sort]: orderBy }
    };

    // Execute query and count total
    const [companies, total] = await Promise.all([
      this.prisma.company.findMany(options),
      this.prisma.company.count({ where })
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a specific company by ID
   */
  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id }
    });
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    
    return company;
  }

  /**
   * Update a company
   */
  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    try {
      // Check if company exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { id }
      });
      
      if (!existingCompany) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      
      return await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to update company', error.message);
    }
  }

  /**
   * Delete a company
   */
  async remove(id: number) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id }
    });
    
    if (!existingCompany) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    
    return this.prisma.company.delete({ where: { id } });
  }

  /**
   * Get all internships at a specific company
   */
  async getCompanyInternships(id: number, filterDto: any) {
    // Check if company exists
    const company = await this.prisma.company.findUnique({
      where: { id }
    });
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    
    // Build where conditions based on filters
    const where: Prisma.InternshipWhereInput = {
      companyId: id
    };
    
    const {
      limit = 10,
      page = 1,
      orderBy = 'asc',
      sort = 'id'
    } = filterDto;

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
}