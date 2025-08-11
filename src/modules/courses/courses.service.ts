import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from 'src/generated/nestjs-dto/create-course.dto';
import { UpdateCourseDto } from 'src/generated/nestjs-dto/update-course.dto';
import { Prisma } from '@prisma/client';
import { CourseFilterDto } from 'src/dto/filters/filter.course.dto';

@Injectable()
export class CourseService {
  // Find all distinct years from registered courses
  async findAllOptions() {
    try {
      const years = await this.prisma.course.groupBy({
        by: ['year'],
        orderBy: {
          year: 'asc',
        },
      });

      // Extract just the year values and return as an array
      return years.map((item) => item.year);
    } catch (error) {
      console.error('Error fetching course years:', error);
      throw new InternalServerErrorException('Failed to fetch course years');
    }
  }
  constructor(private readonly prisma: PrismaService) {}

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
  async findAll(pag?: CourseFilterDto) {
    const defaultLimit = 16;
    const defaultPage = 1;

    const {
      limit,
      page,
      orderBy,
      sort,
      nameCode,
      active,
      years,
      semesters,
      subjectId,
      curriculumId,
      branchId,
      facultyId,
    } = pag || {};

    const whereCondition: Prisma.courseWhereInput = {
      ...(nameCode && {
        OR: [
          { subject: { thaiName: { contains: nameCode } } },
          { subject: { engName: { contains: nameCode } } },
          { subject: { code: { contains: nameCode } } },
        ],
      }),

      ...(active && { active }),
      ...(years?.length && { OR: years.map((y) => ({ year: Number(y) })) }),
      ...(semesters?.length && {
        OR: semesters.map((s) => ({ semester: Number(s) })),
      }),
      ...(subjectId && { subjectId }),
      ...(curriculumId && { subject: { curriculumId } }),
      ...(branchId && { subject: { curriculum: { branchId } } }),
      ...(facultyId && { subject: { curriculum: { branch: { facultyId } } } }),
    };

    // Pagination mode
    const options: Prisma.courseFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [sort ?? 'id']: orderBy ?? 'asc' },
      where: whereCondition,
      include: {
        subject: true,
      },
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
                  skill: {
                    select: { id: true, engName: true, thaiName: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      const studentCount = await this.prisma.student.count({
        where: {
          skill_collections: {
            some: {
              courseId: id,
            },
          },
        },
      });
      return { ...course, studentCount };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch course',
        error.message,
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
