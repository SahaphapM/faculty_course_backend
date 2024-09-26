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
import { CourseDetail } from './entities/courseDetail.entity';
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

    @InjectRepository(CourseDetail)
    private readonly courseDetailRepository: Repository<CourseDetail>,

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
    const { page, limit, sort, order, search } = paginationDto;

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
      relations: { courseDetails: { student: true } },
    });
  }

  // Find a single course by ID
  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: {
        courseDetails: { student: true, skillCollections: true },
        subject: { skillDetails: true },
      },
    });

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
    courseDetails: CourseDetail[],
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (!course.subject) {
      throw new BadRequestException(
        'Course must have a subject before import students',
      );
    }

    // Ensure courseDetails is initialized
    course.courseDetails = course.courseDetails || [];

    // Create a set of existing student IDs for quick lookup
    const existingStudentIds = new Set(
      course.courseDetails.map((courseDetail) => courseDetail.student.id),
    );

    // Process each student to add if not already present
    for (const courseDetail of courseDetails) {
      if (!existingStudentIds.has(courseDetail.student.id)) {
        const student = await this.studentsService.findOne(
          courseDetail.student.id,
        );
        if (!student) {
          throw new NotFoundException(
            `Student with ID ${student.id} not found`,
          );
        }

        courseDetail.skillCollections = courseDetail.skillCollections || [];

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
          courseDetail.skillCollections.push(skillCollectionSaved);
        }
        // Save and add new course detail
        course.courseDetails.push(
          await this.courseDetailRepository.save<CourseDetail>(courseDetail),
        );

        // Update the set with the newly added student ID
        existingStudentIds.add(courseDetail.student.id);
      }
    }

    // Save the updated course
    return await this.courseRepository.save(course);
  }

  async removeStudent(
    courseId: string,
    courseDetailId: number,
  ): Promise<Course> {
    const course = await this.findOne(courseId);

    // Find the CourseDetail that matches the studentId to be removed
    const courseDetailToRemove = course.courseDetails.find(
      (courseDetail) => courseDetail.id === courseDetailId,
    );

    if (courseDetailToRemove) {
      // Remove the course detail from the courseDetails array
      course.courseDetails = course.courseDetails.filter(
        (courseDetail) => courseDetail !== courseDetailToRemove,
      );

      // Save the updated course
      await this.courseRepository.save(course);

      // Delete the corresponding CourseDetail record from the database
      await this.courseDetailRepository.delete(courseDetailToRemove.id);
    }

    return course;
  }

  async selectSubject(id: string, subjectId: string): Promise<Course> {
    const course = await this.findOne(id);
    const subject = await this.subjectsService.findOne(subjectId);
    if (course.subject && course.courseDetails) {
      await this.createSkillCollection(
        subject.skillDetails,
        course.courseDetails,
      );
    }
    delete course.courseDetails;
    course.subject = subject;

    // Save the updated course
    return await this.courseRepository.save(course);
  }
  async createSkillCollection(
    skillDetails: SkillDetail[],
    courseDetails: CourseDetail[],
  ) {
    for (let i = 0; i < courseDetails.length; i++) {
      if (courseDetails[i].skillCollections) {
        await this.skillCollectionsRepository.remove(
          courseDetails[i].skillCollections,
        );
      } else {
        courseDetails[i].skillCollections = [];
      }

      for (let index = 0; index < skillDetails.length; index++) {
        const skillCollection = new SkillCollection();
        skillCollection.skillDetail = skillDetails[index];
        skillCollection.student = courseDetails[i].student;
        skillCollection.acquiredLevel = 0;
        skillCollection.pass = false;
        // Exclude the courseDetail property to avoid circular reference
        delete skillCollection.courseDetail;
        const skillCollectionSaved =
          await this.skillCollectionsRepository.save<SkillCollection>(
            skillCollection,
          );
        courseDetails[i].skillCollections.push(skillCollectionSaved);
      }
      await this.courseDetailRepository.save(courseDetails[i]);
    }
    return courseDetails;
  }
}
