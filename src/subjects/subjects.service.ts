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
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { SkillDetail } from 'src/skills/entities/skillDetail.entity';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
    @InjectRepository(Curriculum)
    private curriculumsRepository: Repository<Curriculum>,
    @InjectRepository(SkillDetail)
    private readonly SkillDetailsRepository: Repository<SkillDetail>,
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
        relations: ['curriculums', 'clos', 'skillDetails'],
      });
    } catch (error) {
      throw new BadRequestException('Failed to get subjects');
    }
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({
      where: { id },
      relations: { skillDetails: { skill: true } },
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

  async selectSkills(
    id: string,
    skillDetails: SkillDetail[],
  ): Promise<Subject> {
    const subject = await this.subjectsRepository.findOne({
      where: { id },
      relations: { skillDetails: true },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // Ensure skillDetails is initialized
    subject.skillDetails = subject.skillDetails || [];

    // const existingSkillDetails = new Set(
    //   subject.skillDetails.map((skillDetail) => skillDetail.id),
    // );
    // for (const SkillDetail of skillDetails) {
    //   if (!existingSkillDetails.has(SkillDetail.id)) {
    //     // Check if the skillDetail with the same ID already exists

    //     const skillDetail = await this.SkillDetailsRepository.save(SkillDetail);
    //     console.log('save or update', skillDetail);

    //     subject.skillDetails.push(skillDetail);
    //     // Update the set with the newly added skillDetail
    //     existingSkillDetails.add(SkillDetail.id);
    //   } else {
    //     console.log('Original', SkillDetail);
    //   }
    // }

    for (let index = 0; index < skillDetails.length; index++) {
      // Check if the skillDetail with the same ID already exists
      const exists = subject.skillDetails.some(
        (sd) => sd.id === skillDetails[index].id,
      );
      if (!exists) {
        const skillDetail = await this.SkillDetailsRepository.save(
          skillDetails[index],
        );

        subject.skillDetails.push(skillDetail);
      }
    }

    try {
      return await this.subjectsRepository.save(subject);
    } catch (error) {
      throw new BadRequestException(
        'Failed to update SkillDetail in Subject',
        error.message,
      );
    }
  }

  async updateSkillDetail(skillDetail: SkillDetail): Promise<SkillDetail> {
    try {
      return await this.SkillDetailsRepository.save(skillDetail);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update SkillDetail ID : ${skillDetail.id}`,
        error.message,
      );
    }
  }

  async removeSkill(id: string, skillDetailId: number): Promise<Subject> {
    // Fetch the subject with the associated skillDetails
    const subject = await this.subjectsRepository.findOne({
      where: { id },
      relations: { skillDetails: true },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // Find the skillDetail to remove
    const skillDetailToRemove = subject.skillDetails.find(
      (skillDetail) => skillDetail.id === skillDetailId,
    );

    if (!skillDetailToRemove) {
      throw new NotFoundException(
        `SkillDetail with ID ${skillDetailId} not found`,
      );
    }

    // Filter out the skillDetail from the subject
    subject.skillDetails = subject.skillDetails.filter(
      (skillDetail) => skillDetail.id !== skillDetailId,
    );

    try {
      // Delete the skillDetail from the database
      await this.SkillDetailsRepository.delete(skillDetailId);

      // Save the updated subject
      await this.subjectsRepository.save(subject);

      // Return the updated subject with the remaining skillDetails
      return await this.subjectsRepository.findOne({
        where: { id },
        relations: { skillDetails: true },
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
