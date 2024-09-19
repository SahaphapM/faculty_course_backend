import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { Faculty } from './entities/faculty.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FacultiesService {
  constructor(
    @InjectRepository(Faculty)
    private facultiesRepository: Repository<Faculty>,
  ) {}
  async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    try {
      const faculty = this.facultiesRepository.create(createFacultyDto);
      return await this.facultiesRepository.save(faculty);
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to create faculty');
    }
  }

  async findAll(): Promise<Faculty[]> {
    try {
      return await this.facultiesRepository.find({
        relations: { branches: true, departments: true },
      });
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to fetch faculties');
    }
  }

  async findAllDetails(): Promise<any[]> {
    try {
      const faculties = await this.facultiesRepository
        .createQueryBuilder('faculty')
        .leftJoinAndSelect('faculty.branches', 'branch')
        .leftJoinAndSelect('branch.curriculums', 'curriculum')
        .leftJoinAndSelect('curriculum.subjects', 'subject')
        .leftJoinAndSelect('subject.skillDetails', 'skillDetail') // Changed from 'subject.skills' to 'subject.skillDetails'
        .leftJoinAndSelect('skillDetail.skill', 'skill') // Join through skillDetail to skill
        .leftJoinAndSelect('skill.techSkills', 'techSkill')
        .select([
          'faculty.id',
          'faculty.name',
          'branch.id',
          'branch.name',
          'curriculum.id',
          'curriculum.thaiName',
          'subject.id',
          'subject.thaiName',
          'skillDetail.id', // Include skillDetail ID if needed
          'skill.id',
          'skill.name',
          'techSkill.id',
          'techSkill.name',
        ])
        .getMany();
  
      // Transform the result into a hierarchical structure
      return faculties.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        branches: faculty.branches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          curriculums: branch.curriculums.map((curriculum) => ({
            id: curriculum.id,
            name: curriculum.thaiName || curriculum.engName,
            subjects: curriculum.subjects.map((subject) => ({
              id: subject.id,
              name: subject.thaiName || subject.engName,
              skills: subject.skillDetails.map((skillDetail) => ({
                id: skillDetail.skill.id, // Access skill through skillDetail
                name: skillDetail.skill.name,
                techSkills: skillDetail.skill.techSkills.map((techSkill) => ({
                  id: techSkill.id,
                  name: techSkill.name,
                })),
              })),
            })),
          })),
        })),
      }));
    } catch (error) {
      throw new Error('Failed to fetch details');
    }
  }
  

  async findOne(id: string): Promise<Faculty> {
    try {
      const faculty = await this.facultiesRepository.findOne({
        where: { id },
        relations: { branches: true, departments: true },
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
    id: string,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    try {
      const existingFaculty = await this.facultiesRepository.findOne({
        where: { id },
      });
      if (!existingFaculty) {
        throw new NotFoundException('Faculty not found');
      }
      Object.assign(existingFaculty, updateFacultyDto);
      await this.facultiesRepository.save(existingFaculty);
      return await this.facultiesRepository.findOne({
        where: { id },
        relations: { branches: true, departments: true },
      });
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to update faculty');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.facultiesRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Faculty not found');
      }
    } catch (error) {
      // Handle specific error types here
      throw new Error('Failed to remove faculty');
    }
  }
}
