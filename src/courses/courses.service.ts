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
import { Student } from 'src/students/entities/student.entity';
import { CourseDetail } from './entities/courseDetail.entity';
import { StudentsService } from 'src/students/students.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(CourseDetail)
    private readonly courseDetailRepository: Repository<CourseDetail>,

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

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      relations: { courseDetails: { student: true } },
    });
  }

  // Find a single course by ID
  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: { courseDetails: { student: true } },
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

  async importStudents(id: string, createStudents: Student[]): Promise<Course> {
    const course = await this.findOne(id);

    // Ensure courseDetails is initialized
    course.courseDetails = course.courseDetails || [];

    // Create a set of existing student IDs for quick lookup
    const existingStudentIds = new Set(
      course.courseDetails.map((courseDetail) => courseDetail.student.id),
    );

    // Process each student to add if not already present
    for (const studentData of createStudents) {
      if (!existingStudentIds.has(studentData.id)) {
        const student = await this.studentsService.findOne(studentData.id);
        const courseDetail = new CourseDetail();
        courseDetail.student = student;

        // Save and add new course detail
        const savedCourseDetail =
          await this.courseDetailRepository.save(courseDetail);
        course.courseDetails.push(savedCourseDetail);

        // Update the set with the newly added student ID
        existingStudentIds.add(studentData.id);
      }
    }

    // Save the updated course
    return await this.courseRepository.save(course);
  }

  async removeStudent(courseId: string, studentId: string): Promise<Course> {
    const course = await this.findOne(courseId);

    // Find the CourseDetail that matches the studentId to be removed
    const courseDetailToRemove = course.courseDetails.find(
      (courseDetail) => courseDetail.student.id === studentId,
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
}