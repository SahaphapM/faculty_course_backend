import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto'; // Create this DTO
import { UpdateCourseDto } from './dto/update-course.dto'; // Create this DTO
import { Course } from './entities/course.entity';
import { CourseStudentDetail } from './entities/courseStudentDetail.entity';
import { StudentsService } from 'src/students/students.service';
import { SubjectsService } from 'src/subjects/subjects.service';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { FindManyOptions } from 'typeorm';
import { Like } from 'typeorm';
import { SkillCollection } from 'src/students/entities/skil-collection.entity';
import { SkillDetail } from 'src/skills/entities/skillDetail.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(CourseStudentDetail)
    private readonly courseStudentDetailRepository: Repository<CourseStudentDetail>,

    @InjectRepository(SkillCollection)
    private readonly skillCollectionsRepository: Repository<SkillCollection>,

    private readonly subjectsService: SubjectsService,

    private readonly studentsService: StudentsService, // Inject StudentsService
  ) {}

  // Create a new course
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const newCourse = this.courseRepository.create(createCourseDto);
    try {
      return await this.courseRepository.save(newCourse);
    } catch (error) {
      throw new BadRequestException('Failed to create course');
    }
  }

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Course[]; total: number }> {
    const { page, limit, sort, order, search, columnId, columnName } =
      paginationDto;

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

    const [result, total] = await this.courseRepository.findAndCount(options);

    return { data: result, total };
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      relations: {
        subject: { skillDetails: true },
      },
    });
  }

  // Find a single course by ID
  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.courseStudentDetails', 'courseStudentDetails')
      .leftJoinAndSelect('courseStudentDetails.student', 'student')
      .leftJoinAndSelect('course.subject', 'subject')
      .leftJoinAndSelect('subject.skillDetails', 'skillDetail')
      .leftJoinAndSelect('skillDetail.skill', 'skill')
      .select([
        'course.id',
        'course.name',
        'course.description',
        'course.active',
        'courseStudentDetails.id',
        'student.id', // Select only the student id
        'student.name', // Select only the student name
        'subject.id',
        'subject.thaiName',
        'subject.engName',
        'subject.description',
        'skillDetail.id',
        'skillDetail.requiredLevel',
        'skillDetail.description',
        'skill.name',
        'skill.description',
        'skill.domain',
      ])
      .where('course.id = :id', { id })
      .getOne();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  // Update an existing course
  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id); // Ensure the course exists

    const updatedCourse = this.courseRepository.merge(course, updateCourseDto);
    try {
      return await this.courseRepository.save(updatedCourse);
    } catch (error) {
      throw new BadRequestException('Failed to Update course');
    }
  }

  // Delete a course by ID
  async remove(id: string): Promise<void> {
    const result = await this.courseRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  async importStudents(
    id: string,
    courseStudentDetails: CourseStudentDetail[],
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (!course.subject) {
      throw new BadRequestException(
        'Course must have a subject before import students',
      );
    }

    // Ensure courseStudentDetails is initialized
    course.courseStudentDetails = course.courseStudentDetails || [];

    // Create a set of existing student IDs for quick lookup
    const existingStudentIds = new Set(
      course.courseStudentDetails.map(
        (courseStudentDetail) => courseStudentDetail.student.id,
      ),
    );

    // Process each student to add if not already present
    for (const courseStudentDetail of courseStudentDetails) {
      if (!existingStudentIds.has(courseStudentDetail.student.id)) {
        const student = await this.studentsService.findOne(
          courseStudentDetail.student.id,
        );
        if (!student) {
          throw new NotFoundException(
            `Student with ID ${student.id} not found`,
          );
        }

        courseStudentDetail.skillCollections =
          courseStudentDetail.skillCollections || [];

        for (
          let index = 0;
          index < course.subject.skillDetails.length;
          index++
        ) {
          const skillCollection = new SkillCollection();
          skillCollection.skillDetail = course.subject.skillDetails[index];
          skillCollection.student = student;
          skillCollection.acquiredLevel = 0;
          skillCollection.pass = false;
          const skillCollectionSaved =
            await this.skillCollectionsRepository.save<SkillCollection>(
              skillCollection,
            );
          console.log(skillCollectionSaved);
          courseStudentDetail.skillCollections.push(skillCollectionSaved);
        }
        // Save and add new course detail
        course.courseStudentDetails.push(
          await this.courseStudentDetailRepository.save<CourseStudentDetail>(
            courseStudentDetail,
          ),
        );

        // Update the set with the newly added student ID
        existingStudentIds.add(courseStudentDetail.student.id);
      }
    }

    // Save the updated course
    return await this.courseRepository.save(course);
  }

  async removeStudent(
    courseId: string,
    courseStudentDetailId: number,
  ): Promise<Course> {
    const course = await this.findOne(courseId);

    // Find the CourseStudentDetail that matches the studentId to be removed
    const courseStudentDetailToRemove = course.courseStudentDetails.find(
      (courseStudentDetail) => courseStudentDetail.id === courseStudentDetailId,
    );

    if (courseStudentDetailToRemove) {
      // Remove the course detail from the courseStudentDetails array
      course.courseStudentDetails = course.courseStudentDetails.filter(
        (courseStudentDetail) =>
          courseStudentDetail !== courseStudentDetailToRemove,
      );
      if (courseStudentDetailToRemove.skillCollections) {
        // Remove SkillCollection records from the database
        await this.skillCollectionsRepository.remove(
          courseStudentDetailToRemove.skillCollections,
        );
      }

      // Save the updated course
      await this.courseRepository.save(course);

      // Delete the corresponding CourseStudentDetail record from the database
      await this.courseStudentDetailRepository.delete(
        courseStudentDetailToRemove.id,
      );
    }

    return course;
  }

  async selectSubject(id: string, subjectId: string): Promise<Course> {
    const course = await this.findOne(id);
    const subject = await this.subjectsService.findOne(subjectId);
    if (course.subject && course.courseStudentDetails) {
      await this.createSkillCollection(
        subject.skillDetails,
        course.courseStudentDetails,
      );
    }
    delete course.courseStudentDetails;
    course.subject = subject;

    // Save the updated course
    return await this.courseRepository.save(course);
  }
  async createSkillCollection(
    skillDetails: SkillDetail[],
    courseStudentDetails: CourseStudentDetail[],
  ) {
    for (let i = 0; i < courseStudentDetails.length; i++) {
      if (courseStudentDetails[i].skillCollections) {
        await this.skillCollectionsRepository.remove(
          courseStudentDetails[i].skillCollections,
        );
      } else {
        courseStudentDetails[i].skillCollections = [];
      }

      for (let index = 0; index < skillDetails.length; index++) {
        const skillCollection = new SkillCollection();
        skillCollection.skillDetail = skillDetails[index];
        skillCollection.student = courseStudentDetails[i].student;
        skillCollection.acquiredLevel = 0;
        skillCollection.pass = false;
        // Exclude the courseStudentDetail property to avoid circular reference
        delete skillCollection.courseStudentDetail;
        const skillCollectionSaved =
          await this.skillCollectionsRepository.save<SkillCollection>(
            skillCollection,
          );
        courseStudentDetails[i].skillCollections.push(skillCollectionSaved);
      }
      await this.courseStudentDetailRepository.save(courseStudentDetails[i]);
    }
    return courseStudentDetails;
  }
}
