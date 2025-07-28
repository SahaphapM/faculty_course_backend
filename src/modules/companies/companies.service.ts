import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from 'src/generated/nestjs-dto/create-company.dto';
import { UpdateCompanyDto } from 'src/generated/nestjs-dto/update-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  BaseFilterParams,
  PaginatedResult,
} from 'src/dto/filters/filter.base.dto';
import { Company } from 'src/generated/nestjs-dto/company.entity';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}
  create(createCompanyDto: CreateCompanyDto) {
    const company = this.prisma.company.create({
      data: createCompanyDto,
    });
    return company;
  }

  async findAll(filter: BaseFilterParams): Promise<PaginatedResult<Company>> {
    const { search, page = 1, limit = 10, sort } = filter;
    const skip = (page - 1) * limit;

    const data = await this.prisma.company.findMany({
      skip,
      take: limit,
      orderBy: sort
        ? { [sort.replace('-', '')]: sort.startsWith('-') ? 'desc' : 'asc' }
        : { id: 'asc' },
      where: {
        name: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(data.length / limit);

    return {
      data,
      meta: {
        total: data.length,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    };
  }

  findOne(id: number): Promise<Company> {
    return this.prisma.company.findUnique({ where: { id } });
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  remove(id: number) {
    return this.prisma.company.delete({ where: { id } });
  }
}
