import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { SkillMapping, Subject } from '../../entities/subject.entity';
import { SkillDetail } from 'src/entities/skillDetail.entity';
import { SkillsService } from 'src/modules/skills/skills.service';
import { Clo } from '../../entities/clo.entity';
import { Curriculum } from '../../entities/curriculum.entity';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateSkillDto } from 'src/dto/skill/create-skill.dto';
import { CreateSubjectDto } from 'src/dto/subject/create-subject.dto';
import { UpdateSubjectDto } from 'src/dto/subject/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
    @InjectRepository(Curriculum)
    private curriculumsRepository: Repository<Curriculum>,
    @InjectRepository(SkillDetail)
    private readonly SkillDetailsRepository: Repository<SkillDetail>,

    private readonly skillsService: SkillsService,
  ) {}

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Subject[]; total: number }> {
    // console.log(paginationDto);
    const { page, limit, sort, order, search } = paginationDto;
    // console.log(search);

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

    // console.log('Query options:', options); // Debugging line

    const [result, total] = await this.subjectsRepository.findAndCount(options);

    // console.log('Result:', result); // Debugging line
    // console.log('Total:', total); // Debugging line

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
      relations: { skillDetails: { skill: { parent: true } } },
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
    const subject = await this.findOne(id);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // Ensure skillDetails is initialized
    subject.skillDetails = subject.skillDetails || [];

    const notSameSkillDetails = skillDetails.filter(
      (newSkillDetail) =>
        !subject.skillDetails.some(
          (subjectSkillDetail) =>
            subjectSkillDetail.skill.id === newSkillDetail.skill.id,
        ),
    );

    for (let index = 0; index < notSameSkillDetails.length; index++) {
      let skillDetail = this.SkillDetailsRepository.create(
        notSameSkillDetails[index],
      );
      skillDetail = await this.SkillDetailsRepository.save(skillDetail);

      subject.skillDetails.push(skillDetail);
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

  async skillMappings(skillMapping: SkillMapping[]) {
    //////////// Should sort the skillMapping array on the SubjectID  ////////////
    if (!skillMapping) {
      throw new BadRequestException('Skill Mapping data not provided');
    }

    const distinctSubjectIds = Array.from(
      new Set(skillMapping.map((map) => map.subjectId)),
    ); // get distinct subject IDs to map with skills with same subject ID

    // Loop through distinct subject IDs
    for (let index = 0; index < distinctSubjectIds.length; index++) {
      const subject = await this.findOne(distinctSubjectIds[index]);

      if (!subject) {
        throw new NotFoundException(
          `Subject with ID ${skillMapping[index].subjectId} not found`,
        );
      }

      // Filter skillMapping array to get skills of the current subject
      const skillMapingOfSubjects = skillMapping.filter(
        (map) => map.subjectId === subject.id,
      );

      // Loop through skillMapping array of the current subject
      for (let i = 0; i < skillMapingOfSubjects.length; i++) {
        let skill = await this.skillsService.findOne(
          skillMapingOfSubjects[i].skillId.toString(),
        );

        if (!skill) {
          // throw new NotFoundException(`Skill with ID ${skillMaping[index].skillId} not found`);

          // Create new skill if not found
          const createSkillDto = new CreateSkillDto();
          createSkillDto.name = skillMapingOfSubjects[index].skillName;
          createSkillDto.description = '';
          createSkillDto.domain = skillMapingOfSubjects[index].skillDomain;
          skill = await this.skillsService.create(createSkillDto);
        }

        // Create skillDetail for the subject
        let skillDetail = new SkillDetail();
        skillDetail.requiredLevel = skillMapingOfSubjects[index].expectedLevel;
        skillDetail.skill.id = skillMapingOfSubjects[index].skillId;
        skillDetail = this.SkillDetailsRepository.create({
          skill: { id: skillMapingOfSubjects[index].skillId },
        });
        subject.skillDetails.push(skillDetail);
      }
      try {
        await this.subjectsRepository.save(subject);
      } catch (error) {
        throw new BadRequestException('Failed to create and select techSkills');
      }
    }
    return 'Skill Mapping completed successfully!!!!';
  }
}
