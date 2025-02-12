import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCourseSpecDto } from 'src/dto/course-specs/create-course-spec.dto';
import { UpdateCourseSpecDto } from 'src/dto/course-specs/update-course-spec.dto';
import { CourseSpec } from 'src/entities/course-spec.entity';
import { Curriculum } from 'src/entities/curriculum.entity';
import { Subject } from 'src/entities/subject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CourseSpecsService {
  constructor(
    @InjectRepository(CourseSpec)
    private courseSpecRepo: Repository<CourseSpec>,

    @InjectRepository(Subject)
    private subRepo: Repository<Subject>,

    @InjectRepository(Curriculum)
    private curRepo: Repository<Curriculum>,
  ) {}

  async createCourseSpec(createCourseSpecDto: CreateCourseSpecDto) {
    console.log('curriculumId', createCourseSpecDto.curriculumId);
    const curriculum = await this.curRepo.findOneBy({
      id: createCourseSpecDto.curriculumId,
    });
    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${createCourseSpecDto.curriculumId} not found`,
      );
    }

    let subject = await this.subRepo.findOneBy({
      code: createCourseSpecDto.subject.code,
    });

    if (!subject) {
      // if not found then create new subject set data from courseSpecDto
      subject = await this.createSubject(
        createCourseSpecDto.curriculumId,
        createCourseSpecDto,
      );
    }

    const courseSpec = this.courseSpecRepo.create({
      ...createCourseSpecDto,
      subject,
    });
    return this.courseSpecRepo.save(courseSpec);
  }

  create(createCourseSpecDto: CreateCourseSpecDto) {
    const courseSpec = this.courseSpecRepo.create(createCourseSpecDto);

    return this.courseSpecRepo.save(courseSpec);
  }

  findAll() {
    return this.courseSpecRepo.find({
      relations: { curriculum: true, subject: true },
    });
  }

  findAllByCurriculum(curriculumId: number) {
    return this.courseSpecRepo.find({
      where: { curriculum: { id: curriculumId } },
      relations: { subject: true, clos: true },
    });
  }

  findOne(id: number) {
    const courseSpec = this.courseSpecRepo.findOneByOrFail({
      id,
    });
    return courseSpec;
  }

  async findExistSubject(code: string) {
    const existSubject = await this.subRepo.findOne({ where: { code } });
    if (!existSubject) {
      return;
    }
    return existSubject;
  }

  async createByCurrId(id: number, dto: CreateCourseSpecDto) {
    const curr = await this.curRepo.findOneBy({ id });
    if (!curr) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    const courseSpec = this.courseSpecRepo.create({
      ...dto,
      curriculum: curr,
    });
    return this.courseSpecRepo.save(courseSpec);
  }
  async updateByCurrId(id: number, dto: UpdateCourseSpecDto) {
    const curr = await this.curRepo.findOneBy({ id });
    if (!curr) {
      throw new NotFoundException(`Curriculum with ID ${id} not found`);
    }
    if (!dto.id) {
      throw new NotFoundException(`Course-spec with ID ${id} not found`);
    }
    const courseSpec = this.courseSpecRepo.create({
      ...dto,
      curriculum: curr,
    });
    return this.courseSpecRepo.save(courseSpec);
  }

  async update(id: number, updateCourseSpecDto: UpdateCourseSpecDto) {
    const courseSpec = await this.findOne(id);

    if (!courseSpec) {
      throw new NotFoundException(`CourseSpec with id ${id} not found`);
    }

    let subject: Subject;

    if (courseSpec.subject.code !== updateCourseSpecDto.subject.code) {
      subject = await this.subRepo.findOneBy({
        code: updateCourseSpecDto.subject.code,
      });

      if (!subject) {
        subject = await this.createSubject(
          updateCourseSpecDto.curriculumId,
          updateCourseSpecDto,
        );
      }
    }

    // Update courseSpec properties
    Object.assign(courseSpec, updateCourseSpecDto);

    const savedCourseSpec = await this.courseSpecRepo.save(courseSpec);
    console.log('CourseSpec', savedCourseSpec);

    return savedCourseSpec;
  }

  remove(id: number) {
    return this.courseSpecRepo.delete(id);
  }

  async createSubject(
    curriculumId: number,
    createCourseSpecDto: Partial<CreateCourseSpecDto>,
  ) {
    const curriculum = await this.curRepo.findOneBy({ id: curriculumId });
    if (!curriculum) {
      throw new NotFoundException(
        `Curriculum with ID ${curriculumId} not found`,
      );
    }

    // สร้าง Subject และเชื่อมโยงกับ Curriculum
    const newSubject = this.subRepo.create({
      ...createCourseSpecDto,
      code: createCourseSpecDto.subject.code,
      curriculum: curriculum, // กำหนด curriculum ทั้งตัว (ไม่ใช่แค่ id)
    });

    return await this.subRepo.save(newSubject);
  }
}
