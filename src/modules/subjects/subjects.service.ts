import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Like, Repository } from 'typeorm';
import { Subject } from '../../entities/subject.entity';
import { Curriculum } from '../../entities/curriculum.entity';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateSubjectDto } from 'src/dto/subject/create-subject.dto';
import { UpdateSubjectDto } from 'src/dto/subject/update-subject.dto';
import { CreateSkillCollection } from 'src/dto/skill/skill-collection.dto';
import { Skill } from 'src/entities/skill.entity';
import { SkillExpectedLevel } from 'src/entities/skill-exp-lvl';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subRepo: Repository<Subject>,
    @InjectRepository(Curriculum)
    private curRepo: Repository<Curriculum>,
    @InjectRepository(SkillExpectedLevel)
    private readonly SkillExpectedLevelsRepository: Repository<SkillExpectedLevel>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
  ) {}

  // async findAllByPage(
  //   paginationDto: PaginationDto,
  // ): Promise<{ data: Subject[]; total: number }> {
  //   // console.log(paginationDto);
  //   const { page, limit, sort, order, search } = paginationDto;
  //   // console.log(search);

  //   const options: FindManyOptions<Subject> = {
  //     take: limit,
  //     skip: (page - 1) * limit,
  //     order: sort ? { [sort]: order } : {},
  //   };

  //   if (search) {
  //     options.where = [
  //       { name: Like(`%${search}%`) },
  //       { engName: Like(`%${search}%`) },
  //       { id: Like(`%${search}%`) },
  //     ];
  //   }

  //   // console.log('Query options:', options); // Debugging line

  //   const [result, total] = await this.subRepo.findAndCount(options);

  //   // console.log('Result:', result); // Debugging line
  //   // console.log('Total:', total); // Debugging line

  //   return { data: result, total };
  // }

  findByList(subjectListId: string[]) {
    return this.subRepo.findBy({ id: In(subjectListId) });
  }
  async create(dto: CreateSubjectDto): Promise<Subject> {
    // if (!dto.skillExpectedLevels.length) return ===> Set to can create subject without skill

    const skillExpectedLevels = await Promise.all(
      dto.skillExpectedLevels.map((s) => {
        if (!s.subject && !s.subject.id) {
          throw new BadRequestException(
            'Subject ID in SkillExpectedLevel is required',
          );
        }
        const existSkill = this.skillRepo.findOneBy({ id: s.skill.id });
        if (!existSkill) {
          throw new BadRequestException(
            `Skill with ID ${s.skill.id} not found`,
          );
        }
        return this.SkillExpectedLevelsRepository.create(s);
      }),
    );
    if (!skillExpectedLevels) {
      throw new NotFoundException('Skills not found');
    }
    const subject = this.subRepo.create({ ...dto, skillExpectedLevels });
    try {
      return await this.subRepo.save(subject);
    } catch (error) {
      throw new BadRequestException('Failed to create subject', error.message);
    }
  }

  async findAll(pag?: PaginationDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const options: FindManyOptions<Subject> = {
      relationLoadStrategy: 'query',
      relations: { skillExpectedLevels: { skill: true } },
      select: {
        id: true,
        code: true,
        name: true,
        engName: true,
        description: true,
        type: true,
        credit: true,

        skillExpectedLevels: {
          id: true,
          expectedLevel: true,
          skill: {
            id: true,
            thaiName: true,
            engName: true,
            parent: { id: true, thaiName: true, engName: true },
            children: { id: true, thaiName: true, engName: true },
          },
        },
      },
    };
    try {
      if (pag) {
        const { search, limit, page, order } = pag;

        options.take = limit || defaultLimit;
        options.skip = ((page || defaultPage) - 1) * (limit || defaultLimit);
        options.order = { id: order || 'ASC' };

        if (search) {
          options.where = [{ name: Like(`%${search}%`) }];
        }
        return await this.subRepo.findAndCount(options);
      } else {
        return await this.subRepo.find(options);
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching subjects:', error);
      throw new InternalServerErrorException('Failed to fetch subjects');
    }
  }

  async findOne(code: string): Promise<Subject> {
    const subject = await this.subRepo.findOne({
      where: { code },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with id ${code} not found`);
    }
    return subject;
  }

  async update(code: string, dto: UpdateSubjectDto) {
    // const subject = await this.subRepo.preload({
    //   id,
    //   ...dto,
    // });
    const subject = await this.subRepo.findOne({ where: { code } });
    if (!subject) {
      throw new NotFoundException(`Subject with id ${code} not found`);
    }
    if (dto.skillExpectedLevels.length > 0) {
      const skillExpectedLevels = await Promise.all(
        dto.skillExpectedLevels.map((s) => {
          const existSkill = this.skillRepo.findOneBy({ id: s.skill.id });
          if (!existSkill) {
            throw new BadRequestException(
              `Skill with ID ${s.skill.id} not found`,
            );
          }
          return this.SkillExpectedLevelsRepository.create({
            ...s,
            subject: { id: subject.id },
          });
        }),
      );
      if (!skillExpectedLevels) {
        throw new NotFoundException('Skills not found');
      }
      subject.skillExpectedLevels = skillExpectedLevels;
    }
    try {
      await this.subRepo.save(subject);
    } catch (error) {
      throw new BadRequestException('Failed to update subject');
    }
  }

  async selectSkills(
    id: string,
    skillExpectedLevels: SkillExpectedLevel[],
  ): Promise<Subject> {
    const subject = await this.findOne(id);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    // Ensure skillExpectedLevels is initialized
    subject.skillExpectedLevels = subject.skillExpectedLevels || [];

    const notSameSkillExpectedLevels = skillExpectedLevels.filter(
      (newSkillExpectedLevel) =>
        !subject.skillExpectedLevels.some(
          (subjectSkillExpectedLevel) =>
            subjectSkillExpectedLevel.skill.id ===
            newSkillExpectedLevel.skill.id,
        ),
    );

    for (let index = 0; index < notSameSkillExpectedLevels.length; index++) {
      let skillExpectedLevel = this.SkillExpectedLevelsRepository.create(
        notSameSkillExpectedLevels[index],
      );
      skillExpectedLevel =
        await this.SkillExpectedLevelsRepository.save(skillExpectedLevel);

      subject.skillExpectedLevels.push(skillExpectedLevel);
    }

    try {
      return await this.subRepo.save(subject);
    } catch (error) {
      throw new BadRequestException(
        'Failed to update SkillExpectedLevel in Subject',
        error.message,
      );
    }
  }

  async updateSkillExpectedLevel(
    skillExpectedLevel: SkillExpectedLevel,
  ): Promise<SkillExpectedLevel> {
    try {
      return await this.SkillExpectedLevelsRepository.save(skillExpectedLevel);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update SkillExpectedLevel ID : ${skillExpectedLevel.id}`,
        error.message,
      );
    }
  }

  async removeSkill(
    code: string,
    skillExpectedLevelId: number,
  ): Promise<Subject> {
    // Fetch the subject with the associated skillExpectedLevels
    const subject = await this.subRepo.findOne({
      where: { code },
      relations: { skillExpectedLevels: true },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${code} not found`);
    }

    // Find the skillExpectedLevel to remove
    const skillExpectedLevelToRemove = subject.skillExpectedLevels.find(
      (skillExpectedLevel) => skillExpectedLevel.id === skillExpectedLevelId,
    );

    if (!skillExpectedLevelToRemove) {
      throw new NotFoundException(
        `SkillExpectedLevel with ID ${skillExpectedLevelId} not found`,
      );
    }

    // Filter out the skillExpectedLevel from the subject
    subject.skillExpectedLevels = subject.skillExpectedLevels.filter(
      (skillExpectedLevel) => skillExpectedLevel.id !== skillExpectedLevelId,
    );

    try {
      // Delete the skillExpectedLevel from the database
      await this.SkillExpectedLevelsRepository.delete(skillExpectedLevelId);

      // Save the updated subject
      await this.subRepo.save(subject);

      // Return the updated subject with the remaining skillExpectedLevels
      return await this.subRepo.findOne({
        where: { code },
        relations: { skillExpectedLevels: true },
      });
    } catch (error) {
      throw new BadRequestException(
        'Failed to remove Skill from Subject',
        error.message,
      );
    }
  }

  async remove(code: string): Promise<void> {
    const subject = await this.findOne(code);

    if (!subject) {
      throw new NotFoundException(`Subject with id ${code} not found`);
    }

    // Remove the subject from related curriculums
    const curriculums = await this.curRepo.find({
      relations: ['subjects'],
    });
    curriculums.forEach((curriculum) => {
      curriculum.subjects = curriculum.subjects.filter(
        (sub) => sub.code !== code,
      );
    });
    await this.curRepo.save(curriculums);

    try {
      await this.subRepo.remove(subject);
    } catch (error) {
      throw new BadRequestException(
        `Failed to remove subject: ${error.message}`,
      );
    }
  }

  async skillMappings(dto: CreateSkillCollection[]) {
    //////////// Should sort the skillMapping array on the SubjectID  ////////////
    if (!dto) {
      throw new BadRequestException('Skill Mapping data not provided');
    }

    const distinctSubjectIds = Array.from(
      new Set(dto.map((map) => map.subjectCode)),
    ); // get distinct subject IDs to map with skills with same subject ID

    // Loop through distinct subject IDs
    for (let index = 0; index < distinctSubjectIds.length; index++) {
      const subject = await this.findOne(distinctSubjectIds[index]);

      if (!subject) {
        throw new NotFoundException(
          `Subject with ID ${dto[index].subjectCode} not found`,
        );
      }

      // Filter skillMapping array to get skills of the current subject
      const groupSkill = dto.filter((map) => map.subjectCode === subject.code);

      // Loop through skillMapping array of the current subject
      for (let i = 0; i < groupSkill.length; i++) {
        const skill = await this.skillRepo.findOneBy({
          id: Number(groupSkill[i].skillId),
        });

        if (!skill) {
          throw new NotFoundException(
            `Skill with ID ${dto[index].skillId} not found`,
          );

          // Create new skill if not found
          // const createSkillDto = new CreateSkillDto();
          // createSkillDto.name = skillMapingOfSubjects[index].skillName;
          // createSkillDto.description = '';
          // createSkillDto.domain = skillMapingOfSubjects[index].skillDomain;
          // skill = await this.skillsService.create(createSkillDto);
        }

        // Create skillExpectedLevel for the subject
        // let skillExpectedLevel = new SkillExpectedLevel();
        // skillExpectedLevel.requiredLevel = skillMapingOfSubjects[index].expectedLevel;
        // skillExpectedLevel.skill.id = skillMapingOfSubjects[index].skillId;
        // skillExpectedLevel = this.SkillExpectedLevelsRepository.create({
        //   skill: { id: skillMapingOfSubjects[index].skillId },
        // });
        // subject.skillExpectedLevels.push(skillExpectedLevel);

        // subject.skills.push(skill);
      }
      try {
        await this.subRepo.save(subject);
      } catch (error) {
        throw new BadRequestException('Failed to create and select techSkills');
      }
    }
    return 'Skill Mapping completed successfully!!!!';
  }

  async filters(curriculumId: string): Promise<Subject[]> {
    // query subject ids and names
    try {
      const subjects = await this.subRepo
        .createQueryBuilder('subject')
        .select(['subject.id', 'subject.name', 'subject.engName'])
        .innerJoin('subject.curriculums', 'curriculum')
        .where('curriculum.id = :curriculumId', { curriculumId })
        .getMany();
      return subjects;
    } catch (error) {
      throw new BadRequestException(
        `Failed to filter subjects: ${error.message}`,
      );
    }
  }
}
