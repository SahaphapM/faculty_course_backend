import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCourseDto } from 'src/generated/nestjs-dto/update-course.dto';
import { Prisma } from '@prisma/client';
import { CourseFilterDto } from 'src/dto/filters/filter.course.dto';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { CreateCourseDtoWithInstructor } from './dto/create-course-with-instructor.dto';
import { DefaultPaginaitonValue } from 'src/configs/pagination.configs';
import { AppErrorCode } from 'src/common/error-codes';

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
  async create(createCourseDtos: CreateCourseDtoWithInstructor[]) {
    const createCoursePromises = createCourseDtos.map(
      async (createCourseDto) => {
        const { subjectId, instructorIds, ...rest } = createCourseDto;

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
              ...(instructorIds && {
                course_instructors: {
                  create: instructorIds.map((id) => ({
                    instructorId: id,
                  })),
                },
              }),
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
    const defaultLimit = DefaultPaginaitonValue.limit;
    const defaultPage = DefaultPaginaitonValue.page;

    const {
      limit,
      page,
      orderBy = DefaultPaginaitonValue.orderBy,
      sort = DefaultPaginaitonValue.sortBy,
      nameCode,
      active,
      years,
      semesters,
      subjectId,
      curriculumId,
      branchId,
      facultyId,
      instructorId
    } = pag || {};

    const AND: Prisma.courseWhereInput[] = [];
    const OR: Prisma.courseWhereInput[] = [];

    if (nameCode) {
      OR.push(
        { subject: { thaiName: { contains: nameCode } } },
        { subject: { engName: { contains: nameCode } } },
        { subject: { code: { contains: nameCode } } },
      );
    }

    if (OR.length) AND.push({ OR });

    if (years?.length) {
      AND.push(...years.map((y) => ({ year: Number(y) })));
    }
    if (semesters?.length) {
      AND.push(...semesters.map((s) => ({ semester: Number(s) })));
    }
    if (active !== undefined) AND.push({ active }); // รองรับทั้ง true/false
    if (subjectId) AND.push({ subjectId });
    if (curriculumId) AND.push({ subject: { curriculumId } });
    if (branchId) AND.push({ subject: { curriculum: { branchId } } });
    if (facultyId)
      AND.push({ subject: { curriculum: { branch: { facultyId } } } });
    if (instructorId)
      AND.push({ course_instructors: { some: { instructorId } } });

    const whereCondition: Prisma.courseWhereInput = AND.length ? { AND } : {};

    const options: Prisma.courseFindManyArgs = {
      take: limit || defaultLimit,
      skip: ((page || defaultPage) - 1) * (limit || defaultLimit),
      orderBy: { [sort ?? 'id']: (orderBy as Prisma.SortOrder) ?? 'asc' },
      where: whereCondition,
      select: {
        id: true,
        year: true,
        semester: true,
        active: true,
        subject: {
          select: {
            id: true,
            engName: true,
            thaiName: true,
            code: true,
            curriculum: {
              select: {
                id: true,
                code: true,
                thaiName: true,
                engName: true,
              },
            },
          },
        },
      },
    };

    try {
      const [courses, total] = await Promise.all([
        this.prisma.course.findMany(options),
        this.prisma.course.count({ where: whereCondition }),
      ]);
      return createPaginatedData(
        courses,
        total,
        Number(page || defaultPage),
        Number(limit || defaultLimit),
      );
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
                    select: {
                      id: true,
                      engName: true,
                      thaiName: true,
                      domain: true,
                    },
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
    // 1) Check if course exists (with a bit of context for better messages)
    const course = await this.prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        year: true,
        semester: true,
        subject: { select: { code: true, thaiName: true, engName: true } },
      },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    // 2) Check FK blockers: skill_collections (onDelete: Restrict)
    const skillCollectionCount = await this.prisma.skill_collection.count({
      where: { courseId: id },
    });

    if (skillCollectionCount > 0) {
      const blockers = await this.prisma.skill_collection.findMany({
        where: { courseId: id },
        select: {
          id: true,
          student: { select: { id: true, code: true, thaiName: true, engName: true } },
          clo: {
            select: {
              id: true,
              subject: { select: { code: true, thaiName: true, engName: true } },
            },
          },
        },
        take: 10,
      });

      const subjectLabel = course.subject?.code
        ? `${course.subject.code} - ${course.subject.thaiName || course.subject.engName || ''}`.trim()
        : 'Unknown Subject';

      throw new ConflictException({
        code: AppErrorCode.FK_CONFLICT,
        message: `Cannot delete Course #${id} (${subjectLabel}; ${course.year}/${course.semester}). There are SkillCollections referencing it.`,
        entity: 'Course',
        entityName: subjectLabel,
        id,
        blockers: [
          {
            relation: 'SkillCollection',
            count: skillCollectionCount,
            field: 'courseId',
            entities: blockers.map((b) => ({
              id: b.id,
              name:
                (b.student?.code
                  ? `${b.student.code} - ${b.student.thaiName || b.student.engName || 'Unknown'}`
                  : `SkillCollection #${b.id}`),
              details: b.clo?.subject
                ? `${b.clo.subject.code} - ${b.clo.subject.thaiName || b.clo.subject.engName}`
                : undefined,
            })),
          },
        ],
        suggestions: [
          'Detach or delete Skill Collections for this course first.',
          'Consider soft-delete/archiving instead of hard delete.',
        ],
      });
    }

    // 3) Safe to delete (course_instructor rows will cascade)
    await this.prisma.course.delete({ where: { id } });
  }

  // assign instructor to course and remove instructor from course (diff update)
  async assignInstructor(id: number, instructorIds: number[]) {
    // กันค่า duplicate ใน input
    const uniqueIds = Array.from(new Set(instructorIds));
    try {
      return await this.prisma.$transaction(async (tx) => {
        const course = await tx.course.findUnique({
          where: { id },
          include: { course_instructors: true },
        });

        if (!course) {
          throw new NotFoundException(`Course with ID ${id} not found`);
        }

        const currentIds = course.course_instructors.map(
          (ci) => ci.instructorId,
        );

        // ids ที่ต้องลบ (เคยมี แต่ไม่ได้ส่งมาแล้ว)
        const instructorIdsToRemove = currentIds.filter(
          (instructorId) => !uniqueIds.includes(instructorId),
        );

        // ids ที่ต้องเพิ่ม (ส่งมา แต่ยังไม่มี)
        const instructorIdsToInsert = uniqueIds.filter(
          (instructorId) => !currentIds.includes(instructorId),
        );

        if (instructorIdsToRemove.length > 0) {
          await tx.course_instructor.deleteMany({
            where: {
              courseId: id,
              instructorId: { in: instructorIdsToRemove },
            },
          });
        }

        if (instructorIdsToInsert.length > 0) {
          await tx.course_instructor.createMany({
            data: instructorIdsToInsert.map((instructorId) => ({
              courseId: id,
              instructorId,
            })),
            skipDuplicates: true, // กัน unique ซ้ำ ๆ หากมี constraint
          });
        }

        // คืนค่าหลังอัปเดต (จะได้เห็นรายการล่าสุด)
        return tx.course.findUnique({
          where: { id },
          include: {
            course_instructors: {
              include: { instructor: true }, // ถ้าต้องการข้อมูล instructor
            },
          },
        });
      });
    } catch (error: any) {
      // หมายเหตุ: deleteMany/createMany จะไม่โยน P2025 เวลาไม่เจอ record
      if (error.code === 'P2003') {
        // FK constraint failed -> มี instructorId ที่ไม่มีอยู่จริง
        throw new BadRequestException('Some instructorIds do not exist');
      }
      throw new BadRequestException(
        'Failed to assign instructor to course: ' + error.message,
      );
    }
  }
}
