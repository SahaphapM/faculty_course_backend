import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InternshipService {
  constructor(private readonly prisma: PrismaService) {}

  async createInternship(data: any) {
    return this.prisma.internship.create({ data });
  }

  async getInternships() {
    return this.prisma.internship.findMany();
  }

  async getInternship(id: number) {
    return this.prisma.internship.findUnique({ where: { id } });
  }

  async updateInternship(id: number, data: any) {
    return this.prisma.internship.update({ where: { id }, data });
  }

  async deleteInternship(id: number) {
    return this.prisma.internship.delete({ where: { id } });
  }
}