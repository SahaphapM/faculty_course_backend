import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterParams, StudentScoreList } from 'src/dto/filter-params.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from 'src/generated/nestjs-dto/create-course.dto';
import { UpdateCourseDto } from 'src/generated/nestjs-dto/update-course.dto';
import { Prisma } from '@prisma/client';
import { StudentsService } from '../students/students.service';
import { ClosService } from '../clos/clos.service';
import { SkillCollection } from 'src/generated/nestjs-dto/skillCollection.entity';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private studentService: StudentsService,
    private cloService: ClosService,
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
  async findAll(pag?: FilterParams) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { code, limit, page, orderBy } = pag || {};

    const whereCondition: Prisma.courseWhereInput = {
      ...(code && { subject: { code: { contains: code } } }),
    };

    const includeCondition: Prisma.courseInclude = {
      skill_collections: { include: { student: true } },
      course_instructors: true,
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

  // import skill collections for students by clo id
  async importSkillCollections(
    courseId: number,
    cloId: number,
    studentScoreList: StudentScoreList[],
  ): Promise<SkillCollection[]> {
    console.log('Import Path 2', courseId, cloId, studentScoreList);
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const clo = await this.cloService.findOne(cloId);

    const skillCollections = [];

    if (!course.subjectId) {
      throw new BadRequestException(
        'Course must have a subject before importing skill collections',
      );
    }

    if (!clo) {
      throw new NotFoundException(`CLO with ID ${cloId} not found`);
    }

    for (const studentScore of studentScoreList) {
      let student = await this.prisma.student.findUnique({
        where: { code: studentScore.studentCode },
      });
      if (!student) {
        // create student with code
        const newStudent = await this.prisma.student.create({
          data: {
            code: studentScore.studentCode,
          },
        });
        student = newStudent;
      }
      // check if student has skill collection of this course and clo
      let skillCollection = await this.prisma.skill_collection.findFirst({
        where: {
          studentId: student.id,
          courseId: course.id,
          cloId: clo.id,
        },
      });
      if (skillCollection) {
        // update skill collection
        skillCollection = await this.prisma.skill_collection.update({
          where: {
            id: skillCollection.id,
          },
          data: {
            gainedLevel: studentScore.gained,
            // check if score more than clo expect skill level
            passed: studentScore.gained >= clo.expectSkillLevel ? true : false,
          },
        });
      } else {
        // create skill collection for student
        skillCollection = await this.prisma.skill_collection.create({
          data: {
            studentId: student.id, // FK เชื่อมกับ student
            courseId: course.id, // FK เชื่อมกับ course
            cloId: clo.id, // FK เชื่อมกับ clo
            gainedLevel: studentScore.gained, // ค่าที่ได้จาก studentScore
            // check if score more than clo expect skill level
            passed: studentScore.gained >= clo.expectSkillLevel ? true : false,
          },
        });
      }

      skillCollections.push(skillCollection);
    }
    return skillCollections;
  }
}
