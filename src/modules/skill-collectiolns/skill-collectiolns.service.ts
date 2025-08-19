import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { SkillCollectionDto } from 'src/generated/nestjs-dto/skillCollection.dto';
import { Prisma } from '@prisma/client';
import {
  collectDescendantLeaves,
  findRootOf,
  getSkillTree,
  propagateSubtree,
  SkillCollectionsHelper,
} from './skill-collectiolns.helper';
import { LearningDomain } from 'src/enums/learning-domain.enum';
import { SkillNode } from './skill-collectiolns.helper';
import { SkillCollectionByCourseFilterDto } from 'src/dto/filters/filter.skill-collection-summary.dto';

@Injectable()
export class SkillCollectionsService {
  constructor(
    private prisma: PrismaService,
    private skillCollectionsHelper: SkillCollectionsHelper,
  ) {}

  async getTranscriptFromAssessment(
    studentCode: string,
  ): Promise<{ specific: SkillNode[]; soft: SkillNode[] }> {
    const student = await this.prisma.student.findUnique({
      where: { code: studentCode },
      select: {
        id: true,
        curriculumId: true,
      },
    });

    console.log('Student:', student);

    if (!student) {
      throw new NotFoundException(`Student with code ${studentCode} not found`);
    }

    // 2. ดึง skill_collection ของ student (สำหรับ subskills)
    const skillCollections = await this.prisma.skill_collection.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        gainedLevel: true,
        clo: { select: { skill: { select: { id: true } } } },
      },
    });

    const skill_assessments = await this.prisma.skill_assessment.findMany({
      where: { studentId: student.id },
      include: {
        skill: true,
      },
    });

    // 3. คำนวณ root skill assessment จาก leaf skill ของ student
    const skillTree = await this.skillCollectionsHelper.skillTree(
      skillCollections,
      skill_assessments,
    );

    // filter root where gainedLevel > 0
    const filteredSkillTree = Array.from(skillTree.values()).filter(
      (skill) => skill.gained > 0,
    );

    // 12. แยก specific (hard) และ soft skill
    const specific = filteredSkillTree.filter(
      (r) =>
        r.domain === LearningDomain.Cognitive ||
        r.domain === LearningDomain.Psychomotor,
    );

    const soft = filteredSkillTree.filter(
      (r) =>
        r.domain === LearningDomain.Affective ||
        r.domain === LearningDomain.Ethics,
    );

    console.log('=== [DEBUG] Specific Skill Tree ===');
    console.dir(specific, { depth: 10 });

    console.log('=== [DEBUG] Soft Skill Tree ===');
    console.dir(soft, { depth: 10 });

    return { specific, soft };
  }

  async getByCloId(
    courseId: number,
    cloId: number,
  ): Promise<Partial<SkillCollectionDto>[]> {
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
    studentScoreList: { studentCode: string; gainedLevel: number }[],
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        subject: {
          select: {
            curriculumId: true,
            curriculum: { select: { branchId: true } },
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const clo = await this.prisma.clo.findUnique({
      where: { id: cloId },
      select: { id: true, expectSkillLevel: true, skillId: true },
    });
    if (!clo) throw new NotFoundException('CLO not found');

    const expect = clo.expectSkillLevel ?? 0;

    // 1) เตรียม student ids แบบแบตช์
    const codes = [...new Set(studentScoreList.map((s) => s.studentCode))];
    // สร้างใหม่ถ้ายังไม่มี (เติม curriculum/branch ตาม course)
    await this.prisma.student.createMany({
      data: codes.map((code) => ({
        code,
        curriculumId: course.subject.curriculumId,
        branchId: course.subject.curriculum.branchId,
      })),
      skipDuplicates: true,
    });
    const students = await this.prisma.student.findMany({
      where: { code: { in: codes } },
      select: { id: true, code: true },
    });
    const studentIdByCode = new Map(students.map((s) => [s.code, s.id]));

    // 2) ดึง skill_collection ปัจจุบันของ CLO นี้ สำหรับนักศึกษาชุดนี้
    const existing = await this.prisma.skill_collection.findMany({
      where: {
        courseId: course.id,
        cloId: clo.id,
        studentId: { in: students.map((s) => s.id) },
      },
      select: { id: true, studentId: true, gainedLevel: true, passed: true },
    });
    const scByStudentId = new Map(existing.map((sc) => [sc.studentId!, sc]));

    // // 3) เตรียม root skills เอาไว้ใช้ตอนสรุป
    // const rootSkills = await this.prisma.skill.findMany({
    //   where: { curriculumId: course.subject.curriculumId, parentId: null },
    //   select: {
    //     id: true,
    //     parentId: true,
    //     domain: true,
    //     thaiName: true,
    //     engName: true,
    //   },
    // });

    // (ออปชัน) กันข้อมูลซ้ำในไฟล์ นับ “ค่าล่าสุด” ของแต่ละ code
    const lastScoreByCode = new Map<string, number>();
    for (const row of studentScoreList)
      lastScoreByCode.set(row.studentCode, row.gainedLevel);

    for (const [studentCode, gainedLevel] of lastScoreByCode) {
      const studentId = studentIdByCode.get(studentCode);
      if (!studentId) continue;

      const curr = scByStudentId.get(studentId);
      const newPassed = (gainedLevel ?? 0) >= expect;

      // 4) ถ้ามีแถวเดิม และค่าทั้งสองเท่ากัน → ข้ามทั้งคนนี้
      if (
        curr &&
        curr.gainedLevel === gainedLevel &&
        curr.passed === newPassed
      ) {
        continue; // ✅ ไม่มี update/ไม่มีสรุป
      }

      // มีการเปลี่ยนแปลง (หรือยังไม่มีแถว) → จัดการใน transaction
      await this.prisma.$transaction(async (tx) => {
        // re-check กัน race: อ่านค่าใหม่ล่าสุดอีกครั้งใน tx
        const fresh = curr
          ? await tx.skill_collection.findUnique({
              where: { id: curr.id },
              select: { id: true, gainedLevel: true, passed: true },
            })
          : null;

        if (
          fresh &&
          fresh.gainedLevel === gainedLevel &&
          fresh.passed === newPassed
        ) {
          return; // มีคนอื่นอัปเดตก่อนหน้าเราแล้ว และค่าเท่ากัน → ข้ามตรงนี้
        }

        // create/update ตามสถานะ
        if (fresh) {
          await tx.skill_collection.update({
            where: { id: fresh.id },
            data: { gainedLevel, passed: newPassed },
          });
        } else {
          await tx.skill_collection.create({
            data: {
              studentId,
              courseId: course.id,
              cloId: clo.id,
              gainedLevel,
              passed: newPassed,
            },
          });
        }

        // 2) หา root ของกิ่งนี้
        const tree = await getSkillTree(course.subject.curriculumId, tx);
        const leafSkillId = clo.skillId;
        const touchedRoot = findRootOf(tree, leafSkillId);

        // 3) หา descendant leaves ใต้ root นี้ (ไม่ใช่ทั้งป่า)
        const leaves = collectDescendantLeaves(tree, touchedRoot);

        // 4) ดึง collection เฉพาะใบไม้ในกิ่งนี้
        const scs = await tx.skill_collection.findMany({
          where: {
            studentId,
            clo: { skillId: { in: leaves } },
          },
          select: { gainedLevel: true, clo: { select: { skillId: true } } },
        });

        // 5) รวม leafLevels
        const leafLevels = new Map<number, number>();
        for (const sc of scs) {
          const sid = sc.clo?.skillId;
          if (!sid) continue;
          const curr = leafLevels.get(sid) ?? 0;
          if (sc.gainedLevel > curr) leafLevels.set(sid, sc.gainedLevel);
        }

        // 6) โพรพาเกตเฉพาะกิ่งนี้
        const levelAtRoot = propagateSubtree(tree, touchedRoot, leafLevels);

        // 7) upsert assessment เฉพาะ root นี้
        await tx.skill_assessment.upsert({
          where: { skillId_studentId: { skillId: touchedRoot, studentId } },
          update: { curriculumLevel: levelAtRoot, finalLevel: levelAtRoot },
          create: {
            studentId,
            skillId: touchedRoot,
            curriculumLevel: levelAtRoot,
            companyLevel: 0,
            finalLevel: levelAtRoot,
          },
        });
      });
    }
  }

  // service
  async getSkillCollectionSummaryByCoursePaginated(
    courseId: number,
    pag: SkillCollectionByCourseFilterDto,
  ) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { studentName, studentCode, page, limit, sort, orderBy } = pag;
    const _limit = Number(limit ?? defaultLimit);
    const _page = Number(page ?? defaultPage);
    const _skip = (_page - 1) * _limit;

    const codePrefix = studentCode ? studentCode.slice(0, 2) : undefined;

    const studentWhere: Prisma.studentWhereInput = {
      thaiName: studentName ? { contains: studentName } : undefined,
      code: codePrefix ? { startsWith: codePrefix } : undefined,
      skill_collections: { some: { courseId } }, // join กับ course
    };

    // ดึง student + total
    const { students, total } = await this.prisma.$transaction(async (tx) => {
      const students = await tx.student.findMany({
        where: studentWhere,
        select: { id: true, code: true, thaiName: true },
        orderBy: { [sort || 'code']: (orderBy as any) ?? 'asc' },
        skip: _skip,
        take: _limit,
      });

      const total = await tx.student.count({ where: studentWhere });
      return { students, total };
    });

    if (!students.length) {
      return createPaginatedData([], 0, _page, _limit);
    }

    const studentIds = students.map((s) => s.id);

    // join skill_collection + skill
    const scRows = await this.prisma.skill_collection.findMany({
      where: { courseId, studentId: { in: studentIds } },
      select: {
        studentId: true,
        gainedLevel: true,
        clo: {
          select: {
            skillId: true,
            skill: { select: { id: true, thaiName: true } },
          },
        },
      },
    });

    const byStudent = new Map<number, Map<number, number[]>>();
    const skillNameMap = new Map<number, string>();

    for (const r of scRows) {
      const sid = r.studentId;
      const skId = r.clo?.skillId ?? null;
      const skName = r.clo?.skill?.thaiName ?? '';
      if (!sid || !skId) continue;

      if (!byStudent.has(sid)) byStudent.set(sid, new Map());
      const m = byStudent.get(sid)!;
      if (!m.has(skId)) m.set(skId, []);
      m.get(skId)!.push(r.gainedLevel);

      if (skName && !skillNameMap.has(skId)) skillNameMap.set(skId, skName);
    }

    /** helpers (ไม่มี any) */
    const mode = (arr: number[]): number | null => {
      if (!arr.length) return null;
      const freq: Record<number, number> = {};
      for (const v of arr) freq[v] = (freq[v] || 0) + 1;
      let ans = arr[0],
        mx = 0;
      for (const [k, v] of Object.entries(freq)) {
        if (v > mx) {
          mx = v;
          ans = Number(k);
        }
      }
      return ans;
    };
    const avg = (arr: number[]): number | null =>
      arr.length
        ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
        : null;
    const min = (arr: number[]): number | null =>
      arr.length ? Math.min(...arr) : null;
    const max = (arr: number[]): number | null =>
      arr.length ? Math.max(...arr) : null;

    /** ✅ ไม่แยกโดเมน: ใส่ skills เป็นก้อนเดียว + summary รวม */
    const data = students.map((stu) => {
      const m = byStudent.get(stu.id);
      const skills: {
        skillId: number;
        skillName: string;
        gainedLevel: number | null;
      }[] = [];
      const allLevels: number[] = [];

      if (m) {
        for (const [skId, levels] of m.entries()) {
          const picked = mode(levels);
          if (levels.length) allLevels.push(...levels);
          skills.push({
            skillId: skId,
            skillName: skillNameMap.get(skId) ?? '',
            gainedLevel: picked,
          });
        }
      }

      return {
        studentId: stu.id,
        studentName: stu.thaiName,
        studentCode: stu.code,
        // ไม่แยก hard/soft แล้ว
        skills,
        // รวมภาพรวมทั้งคอร์สของนิสิตคนนั้น (จะเก็บ/ไม่เก็บก็ได้)
        summary: {
          mode: mode(allLevels),
          avg: avg(allLevels),
          min: min(allLevels),
          max: max(allLevels),
          count: allLevels.length,
        },
      };
    });

    return createPaginatedData(data, total, _page, _limit);
  }
}
