import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { branch, Prisma } from '@prisma/client'; // Import the Prisma-generated Branch type
import { UpdateBranchDto } from 'src/generated/nestjs-dto/update-branch.dto';
import { CreateBranchDto } from 'src/generated/nestjs-dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBranchDto) {
    try {
      const { facultyId, ...rest } = dto;

      // Check if a branch with the same name already exists
      const existBranch = await this.prisma.branch.findFirst({
        where: { thaiName: dto.thaiName },
      });
      if (existBranch) {
        throw new Error(`Branch with name ${dto.thaiName} already exists`);
      }

      // Check if the faculty exists
      const existFaculty = await this.prisma.faculty.findUnique({
        where: { id: facultyId },
      });
      if (!existFaculty) {
        throw new Error(`Faculty with ID ${facultyId} does not exist`);
      }

      // Create the branch
      const branch = await this.prisma.branch.create({
        data: {
          ...rest,
          facultyId,
        },
      });

      return branch;
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  async findAll(pag: PaginationDto) {
    const {
      page = 1,
      limit = 10,
      sort = 'id',
      orderBy = 'asc',
      thaiName,
      engName,
    } = pag;

    const options: Prisma.branchFindManyArgs = {
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sort]: orderBy },
      where: {
        ...(thaiName && { thaiName: { contains: thaiName } }),
        ...(engName && { engName: { contains: engName } }),
      },
    };

    try {
      if (pag) {
        const [branches, total] = await Promise.all([
          this.prisma.branch.findMany(options),
          this.prisma.branch.count({ where: options.where }),
        ]);

        return { data: branches, total };
      } else {
        return await this.prisma.branch.findMany(options);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw new InternalServerErrorException('Failed to fetch branches');
    }
  }

  async findAllOptions() {
    const options = {
      select: {
        id: true,
        thaiName: true,
        engName: true,
        abbrev: true,
      },
    };
    return await this.prisma.branch.findMany(options);
  }

  async findOne(id: number): Promise<branch> {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id },
        include: { curriculum: true, faculty: true },
      });

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${id} not found`);
      }

      return branch;
    } catch (error) {
      throw new Error('Failed to fetch branch');
    }
  }

  async update(id: number, updateBranchDto: UpdateBranchDto): Promise<branch> {
    try {
      const branch = await this.prisma.branch.update({
        where: { id },
        data: updateBranchDto,
      });

      return branch;
    } catch (error) {
      throw new Error('Failed to update branch');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.branch.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error('Failed to remove branch');
    }
  }

  async filters(facultyId: number) {
    try {
      const branches = await this.prisma.branch.findMany({
        where: { facultyId: facultyId },
        select: {
          id: true,
          thaiName: true,
          engName: true,
        },
      });

      return branches;
    } catch (error) {
      throw new Error('Failed to fetch branches');
    }
  }
}
