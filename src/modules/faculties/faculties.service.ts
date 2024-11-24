import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFacultyDto } from '../../dto/faculty/create-faculty.dto';
import { UpdateFacultyDto } from '../../dto/faculty/update-faculty.dto';
import { Faculty } from '../../entities/faculty.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { PaginationDto } from 'src/dto/pagination.dto';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private facRepo: Repository<Faculty>,
  ) { }
  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    try {
      const faculty = this.facRepo.create(createFacultyDto);
      return await this.facRepo.save(faculty);
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to create faculty');
    }
  }

  async findFilters(): Promise<Faculty[]> {
    try {
      return await this.facRepo.find({
        relations: { branches: true },
        select: {
          id: true,
          name: true,
          engName: true,
          branches: { id: true, name: true, engName: true },
        }
      });
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to fetch faculties');
    }
  }

  async findAll(pag?: PaginationDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const options: FindManyOptions<Faculty> = {
      relationLoadStrategy: 'query',
      relations: { branches: true },
      // select: {
      //   id: true,
      //   name: true,
      //   engName: true,
      //   description: true,
      //   abbrev: true,
      //   branches: { id: true, name: true, engName: true, abbrev: true, description: true },
      // },
    };
    try {
      if (pag) {
        const { search, limit, page, order } = pag;

        options.take = limit || defaultLimit;
        options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
        options.order = { id: order || 'ASC' };

        if (search) {
          options.where = [
            { name: Like(`%${search}%`) }
          ];
        }
        return await this.facRepo.findAndCount(options);
      } else {
        return await this.facRepo.find(options);
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching faculties:', error);
      throw new InternalServerErrorException('Failed to fetch faculties');
    }
  }

  // async findAllDetails() {
  // try {
  //   const faculties = await this.facRepo
  //     .createQueryBuilder('faculty')
  //     .leftJoinAndSelect('faculty.branches', 'branch')
  //     .leftJoinAndSelect('branch.curriculums', 'curriculum')
  //     .leftJoinAndSelect('curriculum.subjects', 'subject')
  //     .leftJoinAndSelect('subject.skillDetails', 'skillDetail') // Changed from 'subject.skills' to 'subject.skillDetails'
  //     .leftJoinAndSelect('skillDetail.skill', 'skill') // Join through skillDetail to skill
  //     .leftJoinAndSelect('skill.techSkills', 'techSkill')
  //     .select([
  //       'faculty.id',
  //       'faculty.name',
  //       'branch.id',
  //       'branch.name',
  //       'curriculum.id',
  //       'curriculum.thaiName',
  //       'subject.id',
  //       'subject.thaiName',
  //       'skillDetail.id', // Include skillDetail ID if needed
  //       'skill.id',
  //       'skill.name',
  //       'techSkill.id',
  //       'techSkill.name',
  //     ])
  //     .getMany();
  //   // Transform the result into a hierarchical structure
  //   return faculties.map((faculty) => ({
  //     id: faculty.id,
  //     name: faculty.name,
  //     branches: faculty.branches.map((branch) => ({
  //       id: branch.id,
  //       name: branch.name,
  //       curriculums: branch.curriculums.map((curriculum) => ({
  //         id: curriculum.id,
  //         name: curriculum.thaiName || curriculum.engName,
  //         subjects: curriculum.subjects.map((subject) => ({
  //           id: subject.id,
  //           name: subject.name || subject.engName,
  //           skills: subject.skillDetails.map((skillDetail) => ({
  //             id: skillDetail.skill.id, // Access skill through skillDetail
  //             name: skillDetail.skill.name,
  //             techSkills: skillDetail.skill.techSkills.map((techSkill) => ({
  //               id: techSkill.id,
  //               name: techSkill.name,
  //             })),
  //           })),
  //         })),
  //       })),
  //     })),
  //   }));
  // } catch (error) {
  //   throw new Error('Failed to fetch details');
  // }
  // }

  // async filters(): Promise<Faculty[]> {
  //   // query faculty names and ids
  //   try {
  //     const faculties = await this.facRepo
  //       .createQueryBuilder('faculty')
  //       .select(['faculty.id', 'faculty.name', 'faculty.engName'])
  //       .getMany();
  //     return faculties;
  //   } catch (error) {
  //     throw new Error('Failed to fetch details');
  //   }
  // }

  async findOne(id: number): Promise<Faculty> {
    try {
      const faculty = await this.facRepo.findOne({
        where: { id },
        relations: { branches: true },
      });
      if (!faculty) {
        throw new NotFoundException('Faculty not found');
      }
      return faculty;
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to fetch faculty');
    }
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    try {
      const existingFaculty = await this.facRepo.findOne({
        where: { id },
      });
      if (!existingFaculty) {
        throw new NotFoundException('Faculty not found');
      }
      Object.assign(existingFaculty, updateFacultyDto);
      await this.facRepo.save(existingFaculty);
      return await this.facRepo.findOne({
        where: { id },
        relations: { branches: true },
      });
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to update faculty');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const exist = await this.facRepo.findOne({ where: { id } });
      if (!exist) {
        throw new NotFoundException('Faculty not found');
      } else {
        await this.facRepo.remove(exist);
      }
    } catch (error) {
      // Handle specific error types here
      console.error('Error removing faculty:', error);
      throw new Error('Failed to remove faculty');
    }
  }
}
