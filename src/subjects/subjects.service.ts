import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { Curriculum } from 'src/curriculums/entities/curriculum.entity';
import { Clo } from 'src/clos/entities/clo.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { PaginationDto } from 'src/users/dto/pagination.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
    @InjectRepository(Curriculum)
    private curriculumsRepository: Repository<Curriculum>,
  ) {}

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Subject[]; total: number }> {
    console.log(paginationDto);
    const { page, limit, sort, order, search } = paginationDto;
    console.log(search);

    const options: FindManyOptions<Subject> = {
      take: limit,
      skip: (page - 1) * limit,
      order: sort ? { [sort]: order } : {},
    };

    if (search) {
      options.where = [
        { thaiName: Like(`%${search}%`) },
        { engName: Like(`%${search}%`) },
        { id: Like(`%${search}%`) },
      ];
    }

    console.log('Query options:', options); // Debugging line

    const [result, total] = await this.subjectsRepository.findAndCount(options);

    console.log('Result:', result); // Debugging line
    console.log('Total:', total); // Debugging line

    return { data: result, total };
  }
  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const subject = this.subjectsRepository.create(createSubjectDto);
    try {
      return await this.subjectsRepository.save(subject);
    } catch (error) {
      throw new BadRequestException('Failed to create subject', error.message);
    }
  }

  async findAll(): Promise<Subject[]> {
    try {
      return await this.subjectsRepository.find({
        relations: ['curriculums', 'clos', 'skills'],
      });
    } catch (error) {
      throw new BadRequestException('Failed to get subjects');
    }
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({
      where: { id },
      relations: ['curriculums', 'clos'],
    });
    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }
    return subject;
  }

  async update(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    const subject = await this.subjectsRepository.preload({
      id,
      ...updateSubjectDto,
    });
    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }
    try {
      await this.subjectsRepository.save(subject);
      return this.subjectsRepository.findOne({
        where: { id },
        relations: { clos: true, curriculums: true },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update subject');
    }
  }

  // async addTeacher(id: string, user: User): Promise<Subject> {
  //   const subject = await this.subjectsRepository.findOne({ where: { id } });
  //   if (!subject) {
  //     throw new NotFoundException(`Subject with ID ${id} not found`);
  //   }
  //   if (!subject.teachers) {
  //     subject.teachers = [];
  //   }
  //   subject.teachers.push(user);
  //   try {
  //     await this.subjectsRepository.save(subject);
  //     return this.subjectsRepository.findOne({
  //       where: { id },
  //       relations: { teachers: true },
  //     });
  //   } catch (error) {
  //     throw new BadRequestException('Failed to update Subject', error.message);
  //   }
  // }

  async addCLO(id: string, clo: Clo): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    if (!subject.clos) {
      subject.clos = [];
    }
    subject.clos.push(clo);
    try {
      await this.subjectsRepository.save(subject);
      return this.subjectsRepository.findOne({
        where: { id },
        relations: { clos: true },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update Subject', error.message);
    }
  }

  async selectSkills(id: string, skills: Skill[]): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    subject.skills = skills;
    try {
      await this.subjectsRepository.save(subject);
      return this.subjectsRepository.findOne({
        where: { id },
        relations: { skills: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to update Skill in Subject',
        error.message,
      );
    }
  }

  async removeSkill(id: string, skillId: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({
      where: { id },
      relations: { skills: true },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // Remove the skill from the subject's skills array
    // const newskills = subject.skills.filter((skill) => skill.id !== skillId);
    // console.log(newskills);
    console.log('Before:', subject.skills);
    subject.skills = subject.skills.filter((skill) => skill.id !== skillId);
    console.log('After:', subject.skills);

    try {
      await this.subjectsRepository.save(subject);
      return this.subjectsRepository.findOne({
        where: { id },
        relations: { skills: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to remove Skill from Subject',
        error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    const subject = await this.findOne(id);

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    // Remove the subject from related curriculums
    const curriculums = await this.curriculumsRepository.find({
      relations: ['subjects'],
    });
    curriculums.forEach((curriculum) => {
      curriculum.subjects = curriculum.subjects.filter((sub) => sub.id !== id);
    });
    await this.curriculumsRepository.save(curriculums);

    try {
      await this.subjectsRepository.remove(subject);
    } catch (error) {
      throw new BadRequestException(
        `Failed to remove subject: ${error.message}`,
      );
    }
  }
}
