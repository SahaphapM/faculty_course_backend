import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities/course.entity';
import { CourseEnrollment } from 'src/entities/course-enrollment';
import { SkillCollection } from 'src/entities/skill-collection.entity';
import { Repository } from 'typeorm';
import { FindManyOptions } from 'typeorm';
import { Like } from 'typeorm';
import { SubjectsService } from '../subjects/subjects.service';
import { StudentsService } from '../students/students.service';
import { CreateCourseDto } from 'src/dto/course/create-course.dto';
import { UpdateCourseDto } from 'src/dto/course/update-course.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { Teacher } from 'src/entities/teacher.entity';
import { SkillExpectedLevel } from 'src/entities/skill-exp-lvl';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(CourseEnrollment)
    private readonly courseEnrollRepo: Repository<CourseEnrollment>,

    @InjectRepository(Teacher)
    private readonly teaRepo: Repository<Teacher>,

    @InjectRepository(SkillCollection)
    private readonly skillCollRepo: Repository<SkillCollection>,

    // @InjectRepository(Curriculum)
    // private readonly currRepo: Repository<Curriculum>,

    private readonly subjectsService: SubjectsService,

    private readonly studentsService: StudentsService, // Inject StudentsService
  ) { }

  // Create a new course
  async create(dto: CreateCourseDto): Promise<Course> {
    const { subjectId, teacherListId, ...rest } = dto;
    try {
      const subject = await this.subjectsService.findOne(subjectId);
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }
      // const curriculum = await this.currRepo.findOneBy({ id: curriculumId });
      // if (!curriculum) {
      //   throw new NotFoundException('Curriculum not found');
      // }

      const teachers = await Promise.all(
        teacherListId.map(async (id) => {
          const tea = await this.teaRepo.findOneBy({ id });
          return tea;
        }),
      );

      const newCourse = this.courseRepo.create({
        ...rest,
        subject,
        teachers,
      });
      return await this.courseRepo.save(newCourse);
    } catch (error) {
      throw new BadRequestException(`Failed to create course ${error}`);
    }
  }

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Course[]; total: number }> {
    const { page, limit, sort, order, search } = paginationDto;

    // const queryBuilder = this.courseRepository.createQueryBuilder('course');

    // Include roles in the query
    // queryBuilder.leftJoinAndSelect('course.roles', 'roles');
    // .leftJoinAndSelect('course.courseStudentDetails', 'courseStudentDetails')
    // .leftJoinAndSelect('courseStudentDetails.student', 'student')

    // // Conditionally add joins if columnId and columnName are provided
    // if (columnId && columnName === 'branch') {
    //   // Join user with curriculum
    //   queryBuilder.innerJoin('user.curriculums', 'curriculum');
    //   // Join curriculum with branch
    //   queryBuilder.innerJoin('curriculum.branch', 'branch');
    //   // Filter by branchId
    //   queryBuilder.andWhere('branch.id = :branchId', { branchId: columnId });
    // } else if (columnId && columnName === 'curriculum') {
    //   queryBuilder.innerJoinAndSelect(`user.${columnName}s`, `${columnName}`);
    //   queryBuilder.andWhere(`${columnName}.id = :columnId`, {
    //     columnId,
    //   });
    // }

    const options: FindManyOptions<Course> = {
      take: limit,
      skip: (page - 1) * limit,
      order: sort ? { [sort]: order } : {},
    };

    if (search) {
      options.where = [
        { id: Like(`%${search}%`) },
        { name: Like(`%${search}%`) },

        // { branch: { name: Like(`%${search}%`) } }, // Corrected for nested relation
        // { branch: { faculty: { name: Like(`%${search}%`) } } },
      ];
    }

    const [result, total] = await this.courseRepo.findAndCount(options);

    return { data: result, total };
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepo.find({
      relations: {
        subject: { skillExpectedLevels: true },
      },
    });
  }

  // Find a single course by ID
  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: { subject: { skillExpectedLevels: { skill: true } }, courseEnrollment: { student: true }, teachers: true },
      select: {
        id: true,
        name: true,
        description: true,
        subject: {
          id: true,
          name: true,
          description: true,
          skillExpectedLevels: { id: true, expectedLevel: true, skill: { id: true, name: true } }
        },
        courseEnrollment: {
          student: {
            id: true, name: true,
            skillCollection:
            {
              gainedLevel: true,
              skillExpectedLevels: {
                expectedLevel: true,
                skill: { id: true, name: true }
              },
              passed: true
            }
          },
        },
        teachers: { id: true, name: true }
      },
      relationLoadStrategy: 'query'
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async findCourseEnrolmentByCourseId(id: string): Promise<CourseEnrollment> {
    const courseEnrollment = await this.courseEnrollRepo.findOne({
      where: { course: { id } },
      relations: { student: true, skillCollections: { skillExpectedLevels: { skill: true } } },
      select: {
        id: true,
        student: { id: true, name: true },
        skillCollections: {
          id: true,
          skillExpectedLevels: { id: true, expectedLevel: true, skill: { id: true, name: true } }
        }
      },
      relationLoadStrategy: 'query'
    })

    if (!courseEnrollment) {
      throw new NotFoundException(`Course Enrollment with Course ID ${id} not found`);
    }

    return courseEnrollment;
  }

  // Update an existing course
  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id); // Ensure the course exists
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const updatedCourse = this.courseRepo.merge(course, updateCourseDto);
    try {
      return await this.courseRepo.save(updatedCourse);
    } catch (error) {
      throw new BadRequestException('Failed to Update course');
    }
  }

  // Delete a course by ID
  async remove(id: string): Promise<void> {
    const result = await this.courseRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  async importStudents(id: string, studentListId: string[]) {
    const course = await this.findOne(id);

    if (!course.subject) {
      throw new BadRequestException(
        'Course must have a subject before import students',
      );
    }

    course.courseEnrollment = course.courseEnrollment || [];

    const students = await this.studentsService.findManyByIds(studentListId);
    const missingStudents = studentListId.filter(
      (id) => !students.some((student) => student.id === id),
    );
    if (missingStudents.length > 0) {
      throw new NotFoundException(`Students with IDs ${missingStudents.join(', ')} not found`);
    }

    const newEnrollments = students.map((student) => {
      const courseEnrollment = this.courseEnrollRepo.create({
        student,
        course,
        skillCollections: course.subject.skillExpectedLevels.map((skill) =>
          this.skillCollRepo.create({
            student: student,
            skillExpectedLevels: skill,
          }),
        ),
      });
      return courseEnrollment;
    });

    course.courseEnrollment.push(...newEnrollments);

    return await this.courseRepo.save(course);
  }
  async removeEnrollment(
    courseId: string,
    courseStudentDetailId: number,
  ): Promise<Course> {
    const course = await this.findOne(courseId);

    // Find the CourseStudentDetail that matches the studentId to be removed
    const courseStudentDetailToRemove = course.courseEnrollment.find(
      (courseStudentDetail) => courseStudentDetail.id === courseStudentDetailId,
    );

    if (courseStudentDetailToRemove) {
      // Remove the course detail from the courseStudentDetails array
      course.courseEnrollment = course.courseEnrollment.filter(
        (courseStudentDetail) =>
          courseStudentDetail !== courseStudentDetailToRemove,
      );
      if (courseStudentDetailToRemove.skillCollections) {
        // Remove SkillCollection records from the database
        await this.skillCollRepo.remove(
          courseStudentDetailToRemove.skillCollections,
        );
      }

      // Save the updated course
      await this.courseRepo.save(course);

      // Delete the corresponding CourseStudentDetail record from the database
      await this.courseEnrollRepo.delete(courseStudentDetailToRemove.id);
    }

    return course;
  }

  async selectSubject(id: string, subjectId: string): Promise<Course> {
    const course = await this.findOne(id);
    const subject = await this.subjectsService.findOne(subjectId);
    if (course.subject && course.courseEnrollment) {
      await this.createSkillCollection(
        subject.skillExpectedLevels,
        course.courseEnrollment,
      );
    }
    delete course.courseEnrollment;
    course.subject = subject;

    // Save the updated course
    return await this.courseRepo.save(course);
  }
  async createSkillCollection(
    skillExpectedLevels: SkillExpectedLevel[],
    courseEnr: CourseEnrollment[],
  ) {
    // Create array of skill collections to be saved
    const skillCollectionsToSave: SkillCollection[] = [];

    // Iterate through each course enrollment
    for (let i = 0; i < courseEnr.length; i++) {
      // Remove existing skill collections
      if (courseEnr[i].skillCollections) {
        await this.skillCollRepo.remove(courseEnr[i].skillCollections);
      } else {
        courseEnr[i].skillCollections = [];
      }

      // Iterate through each skill
      for (let index = 0; index < skillExpectedLevels.length; index++) {
        const skillCollection = this.skillCollRepo.create({
          courseEnrollment: courseEnr[i],
          skillExpectedLevels: skillExpectedLevels[index],
          passed: false,
          student: courseEnr[i].student,
        });
        // Exclude the courseStudentDetail property to avoid circular reference
        delete skillCollection.courseEnrollment;

        // Add to array of skill collections to be saved
        skillCollectionsToSave.push(skillCollection);
      }
    }

    // Save all skill collections in one go
    await this.skillCollRepo.save(skillCollectionsToSave);

    // Add saved skill collections to course enrollments
    for (let i = 0; i < courseEnr.length; i++) {
      courseEnr[i].skillCollections = skillCollectionsToSave.filter(
        (skillCollection) =>
          skillCollection.courseEnrollment.id === courseEnr[i].id,
      );
      await this.courseEnrollRepo.save(courseEnr[i]);
    }
    return courseEnr;
  }
}
