import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterParams } from 'src/dto/filter-params.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from 'src/generated/nestjs-dto/create-course.dto';
import { UpdateCourseDto } from 'src/generated/nestjs-dto/update-course.dto';
import { Prisma } from '@prisma/client';
import { StudentsService } from '../students/students.service';
import { ClosService } from '../clos/clos.service';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private studentService: StudentsService,
    private cloService: ClosService,
  ) {}

  // Create a new course(s)
  async create(createCourseDtos: CreateCourseDto[]) {
    const createCoursePromises = createCourseDtos.map(
      async (createCourseDto) => {
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
      },
    );

    try {
      const newCourses = await Promise.all(createCoursePromises);

      return newCourses;
    } catch (error) {
      throw new BadRequestException(
        `Failed to create course: ${error.message}`,
      );
    }
  }

  // Find all courses with pagination and search
  async findAll(pag?: FilterParams) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { code, limit, page, orderBy } = pag || {};

    const whereCondition: Prisma.courseWhereInput = {
      ...(code && { subject: { code: { contains: code } } }),
    };

    const includeCondition: Prisma.courseInclude = {
      // skill_collections: { include: { student: true } },
      course_instructors: true,
      subject: {
        include: {
          curriculums: true,
        },
      },
    };

    if (!pag) {
      // Fetch all courses if no pagination is provided
      return this.prisma.course.findMany({
        where: whereCondition,
        include: includeCondition,
        orderBy: { id: 'asc' }, // Default sorting
      });
    }

    // Pagination mode
    const options: Prisma.courseFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: orderBy ? { id: orderBy } : undefined, // Only add if orderBy exists
      where: whereCondition,
      include: includeCondition,
    };

    try {
      const [courses, total] = await Promise.all([
        this.prisma.course.findMany(options),
        this.prisma.course.count({ where: whereCondition }),
      ]);
      return { data: courses, total };
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
              clos: {
                include: {
                  skill: true,
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

  // Update an existing course
  async update(id: number, updateCourseDto: UpdateCourseDto) {
    console.log('Update Path 2');
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
      throw new BadRequestException('Failed to update course' + error.message);
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
}
