import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Instructor } from '../../entities/instructor.entity';
import { FindManyOptions, In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '../../dto/pagination.dto';
import { CreateInstructorDto } from '../../dto/instructor/create-instructor.dto';
import { UpdateInstructorDto } from '../../dto/instructor/update-instructor.dto';
import { Curriculum } from 'src/entities/curriculum.entity';
import { Branch } from 'src/entities/branch.entity';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectRepository(Branch)
    private braRepo: Repository<Branch>,
    @InjectRepository(Curriculum)
    private curRepo: Repository<Curriculum>,
    @InjectRepository(Instructor)
    private insRepo: Repository<Instructor>,
  ) {}

  // async findAllByPage(
  //   paginationDto: PaginationDto,
  // ): Promise<{ data: Instructor[]; total: number }> {
  //   const { page, limit, sort, order, search, columnId, columnName } =
  //     paginationDto;

  //   const queryBuilder = this.insRepo.createQueryBuilder('teacher');

  //   // Conditionally add joins if columnId and columnName are provided
  //   if (columnId && columnName === 'branch') {
  //     // Join teacher with curriculum
  //     queryBuilder.innerJoin('teacher.curriculums', 'curriculum');
  //     // Join curriculum with branch
  //     queryBuilder.innerJoin('curriculum.branch', 'branch');
  //     // Filter by branchId with explicit table alias
  //     queryBuilder.andWhere('branch.id = :branchId', { branchId: columnId });
  //   } else if (columnId && columnName === 'curriculum') {
  //     queryBuilder.innerJoinAndSelect(
  //       `teacher.${columnName}s`,
  //       `${columnName}`,
  //     );
  //     queryBuilder.andWhere(`${columnName}.id = :columnId`, {
  //       columnId,
  //     });
  //   }

  //   if (search) {
  //     queryBuilder.andWhere(
  //       new Brackets((qb) => {
  //         qb.where('teacher.name LIKE :search', { search: `%${search}%` })
  //           .orWhere('teacher.engName LIKE :search', { search: `%${search}%` })
  //           .orWhere('teacher.email LIKE :search', { search: `%${search}%` });
  //       }),
  //     );
  //   }

  //   if (sort && order) {
  //     queryBuilder.orderBy(`teacher.${sort}`, order);
  //   }

  //   // Log the generated SQL query and its parameters
  //   // console.log('Generated SQL:', queryBuilder.getSql());
  //   // console.log('Query Parameters:', queryBuilder.getParameters());

  //   const [data, total] = await queryBuilder
  //     .take(limit)
  //     .skip((page - 1) * limit)
  //     .getManyAndCount();

  //   // console.log('PaginationDto:', paginationDto);
  //   // console.log('Data:', data);
  //   // console.log('Total:', total);

  //   return { data, total };
  // }

  findByList(c: string[]) {
    return this.insRepo.findBy({ id: In(c) });
  }

  async create(dto: CreateInstructorDto) {
    const { branchId, curriculumsId, ...rest } = dto;

    // Check if the teacher with this email already exists
    const existingTeacher = await this.insRepo.findOne({
      where: { email: rest.email },
    });
    if (existingTeacher) {
      throw new BadRequestException(
        `Teacher with Email ${rest.email} already exists`,
      );
    }

    let existBranch = null;
    let existCurriculums = [];

    // Check for branch if branchId is provided
    if (branchId) {
      existBranch = await this.braRepo.findOne({ where: { id: branchId } });
      if (!existBranch) {
        throw new BadRequestException(
          `Branch with ID ${branchId} does not exist`,
        );
      }
    }

    // Check for curriculums if curriculumsId is provided
    if (curriculumsId && curriculumsId.length > 0) {
      existCurriculums = await this.curRepo.findBy({ id: In(curriculumsId) });
      if (existCurriculums.length !== curriculumsId.length) {
        throw new BadRequestException(
          `Curriculum with ID ${curriculumsId
            .filter((id) => !existCurriculums.find((c) => c.id === id))
            .join(', ')} does not exist`,
        );
      }
    }

    // Create teacher instance, conditionally adding optional fields
    const teacher = this.insRepo.create({
      ...rest,
      specialists: dto.specialists
        ? dto.specialists.map((s) => s).join(', ')
        : '-',
      socials: dto.socials ? JSON.stringify(dto.socials) : '-',
      curriculums: existCurriculums.length > 0 ? existCurriculums : undefined,
      branch: existBranch ?? undefined,
    });

    return await this.insRepo.save(teacher);
  }

  async findAll(pag?: PaginationDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const options: FindManyOptions<Instructor> = {
      relationLoadStrategy: 'query',
      select: {
        id: true,
        email: true,
        thaiName: true,
        engName: true,
        tel: true,
        position: true,
      },
    };
    try {
      if (pag) {
        const { search, limit, page, order } = pag;

        options.take = limit || defaultLimit;
        options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
        options.order = { id: order || 'ASC' };

        if (search) {
          options.where = [{ thaiName: Like(`%${search}%`) }];
        }
        return await this.insRepo.findAndCount(options);
      } else {
        return await this.insRepo.find(options);
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching instructors:', error);
      throw new InternalServerErrorException('Failed to fetch instructors');
    }
  }

  async findAllByCurriculum(curriculumId: number) {
    return await this.insRepo.find({
      where: { curriculums: { id: curriculumId } },
    });
  }

  async findOne(id: number): Promise<Instructor> {
    const teacher = await this.insRepo.findOne({
      where: { id },
    });
    if (!teacher) {
      throw new NotFoundException(
        `Instructor/Coordinator with ID ${id} not found`,
      );
    }
    return teacher;
  }

  async findExistCode(code: string): Promise<Instructor> {
    if (!code) {
      throw new BadRequestException('Code must be provided');
    }
    const teacher = await this.insRepo.findOneBy({ code });
    console.log('Searching for code:', code);

    if (!teacher) {
      throw new NotFoundException(
        `Instructor/Coordinator with Code ${code} not found`,
      );
    }
    return teacher;
  }

  async findByEmail(email: string): Promise<Instructor> {
    const teacher = await this.insRepo.findOne({
      where: { email },
    });
    return teacher;
  }

  async selectCoordinatorToCurriculum(teacherId: number, curriculumId: number) {
    const teacher = await this.insRepo.findOneBy({ id: teacherId });
    const curriculum = await this.curRepo.findOneBy({ id: curriculumId });
    if (!teacher) {
      throw new NotFoundException(
        `Instructor/Coordinator with ID ${teacherId} not found`,
      );
    }
    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${curriculumId} not found`,
      );
    }
    teacher.curriculums.push(curriculum);
    return await this.insRepo.save(teacher);
  }

  async update(
    id: number,
    updateTeacherDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    const teacher = await this.findOne(id);

    if (!teacher) {
      throw new NotFoundException(
        `Instructor/Coordinator with ID ${id} not found`,
      );
    }
    // Update teacher properties
    Object.assign(teacher, updateTeacherDto);
    // teacher.roles = updateTeacherDto.roles;

    try {
      await this.insRepo.save(teacher);
      const teacherUpdated = await this.findOne(id);
      return teacherUpdated;
    } catch (error) {
      throw new BadRequestException('Failed to update Instructor/Coordinator');
    }
  }

  async remove(id: number) {
    const teacher = await this.findOne(id);
    try {
      await this.insRepo.remove(teacher);
      return `Success Delete ID ${id}`;
    } catch (error) {
      throw new BadRequestException('Failed to remove Instructor/Coordinator');
    }
  }
}
