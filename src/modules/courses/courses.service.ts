import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from 'src/generated/nestjs-dto/create-course.dto';
import { UpdateCourseDto } from 'src/generated/nestjs-dto/update-course.dto';
import { Prisma } from '@prisma/client';
import { StudentsService } from '../students/students.service';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private studentService: StudentsService,
  ) {}

  // Create a new course
  async create(createCourseDto: CreateCourseDto) {
    const { subjectId, ...rest } = createCourseDto;

    try {
      // Find the subject
      const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }

      // Create the course
      const newCourse = await this.prisma.course.create({
        data: {
          ...rest,
          subject: { connect: { id: subjectId } },
        },
        include: {
          subject: true,
        },
      });

      return newCourse;
    } catch (error) {
      throw new BadRequestException(
        `Failed to create course: ${error.message}`,
      );
    }
  }

  // Find all courses with pagination and search
  async findAll(pag?: PaginationDto) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { code, limit, page, orderBy: order } = pag || {};

    const options: Prisma.courseFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { id: order || 'asc' },
      include: {
        course_enrollments: { include: { student: true } },
        course_instructors: true,
      },
      where: {
        ...(code && { subject: { code: { contains: code } } }),
      },
    };

    try {
      if (pag) {
        const [courses, total] = await Promise.all([
          this.prisma.course.findMany(options),
          this.prisma.course.count({ where: options.where }),
        ]);
        return { data: courses, total };
      } else {
        return await this.prisma.course.findMany(options);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new InternalServerErrorException('Failed to fetch courses');
    }
  }

  // Find a single course by ID
  async findOne(id: number) {
    try {
      const course = await this.prisma.course.findUnique({
        where: { id },
        include: {
          subject: {
            include: {
              skill_expected_level: {
                include: {
                  skill: {
                    include: {
                      parent: true,
                      subs: true,
                    },
                  },
                },
              },
            },
          },
          course_instructors: true,
        },
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      return course;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch course');
    }
  }

  // Find course enrollments by course ID
  async findCourseEnrollmentByCourseId(id: number) {
    try {
      const courseEnrollments = await this.prisma.course_enrollment.findMany({
        where: { courseId: id },
        include: {
          student: true,
          skill_collections: {
            include: {
              skill_expected_level: {
                include: {
                  skill: {
                    include: {
                      parent: true,
                      subs: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!courseEnrollments) {
        throw new NotFoundException(
          `Course enrollments for course ID ${id} not found`,
        );
      }

      return courseEnrollments;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch course enrollments',
      );
    }
  }

  // Update an existing course
  async update(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      const course = await this.prisma.course.update({
        where: { id },
        data: updateCourseDto,
        include: {
          subject: true,
          course_instructors: true,
        },
      });
      return course;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to update course');
    }
  }

  // Delete a course by ID
  async remove(id: number): Promise<void> {
    try {
      await this.prisma.course.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      throw new BadRequestException('Failed to delete course');
    }
  }

  // Import students into a course
  async importStudents(id: number, studentListCode: string[]) {
    const course = await this.findOne(+id);

    if (!course.subjectId) {
      throw new BadRequestException(
        'Course must have a subject before importing students',
      );
    }

    const students = await this.studentService.findManyByCode(studentListCode);
    const missingStudents = studentListCode.filter(
      (code) => !students.some((student) => student.code === code),
    );

    if (missingStudents.length > 0) {
      throw new NotFoundException(
        `Students with IDs ${missingStudents.join(', ')} not found`,
      );
    }

    // Bulk insert course enrollments
    await this.prisma.course_enrollment.createMany({
      data: students.map((student) => ({
        studentId: student.id,
        courseId: course.id,
      })),
      skipDuplicates: true, // Avoid duplicate enrollments
    });

    await this.prisma.skill_collection.createMany({
      data: students.map(
        (student) =>
          ({
            studentId: student.id,
            courseId: course.id,
          }) as Prisma.skill_collectionCreateManyInput,
      ),
      skipDuplicates: true, // Avoid duplicate skill records
    });

    return await this.findOne(id);
  }

  // Remove a student enrollment from a course
  async removeEnrollment(courseId: number, courseStudentDetailId: number) {
    try {
      await this.prisma.course_enrollment.delete({
        where: { id: courseStudentDetailId },
      });
      return await this.findOne(courseId);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          `Enrollment with ID ${courseStudentDetailId} not found`,
        );
      }
      throw new BadRequestException('Failed to remove enrollment');
    }
  }
}
