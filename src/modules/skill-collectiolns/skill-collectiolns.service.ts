import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClosService } from '../clos/clos.service';
import { StudentsService } from '../students/students.service';
import { SkillCollection } from 'src/generated/nestjs-dto/skillCollection.entity';
import { StudentScoreList } from 'src/generated/nestjs-dto/studentgained.entity';

@Injectable()
export class SkillCollectiolnsService {
  constructor(
    private prisma: PrismaService,
    private studentService: StudentsService,
    private cloService: ClosService,
  ) {}

  async getByCloId(courseId: number, cloId: number) {
    return this.prisma.skill_collection.findMany({
      where: { courseId, cloId },
      select: {
        id: true,
        gainedLevel: true,
        passed: true,
        student: {
          select: {
            code: true,
            thaiName: true,
          },
        },
      },
      orderBy: { student: { code: 'asc' } },
    });
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
