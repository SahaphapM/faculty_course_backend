import { Skill } from 'src/generated/nestjs-dto/skill.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  buildIndex,
  modeThenMax,
  pickAssessedLevel,
} from './curriculums.helper';
import { SkillAssessment } from 'src/generated/nestjs-dto/skillAssessment.entity';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { Prisma } from '@prisma/client';

const prisma = new PrismaService();

const isNum = (v: unknown): v is number =>
  typeof v === 'number' && !Number.isNaN(v);

type TargetLevel = 'on' | 'above' | 'below' | 'all';

export async function findAllDescendants(
  rootSkillId: number,
): Promise<number[]> {
  const result: number[] = [];
  let frontier: number[] = [rootSkillId];
  const seen = new Set<number>();

  while (frontier.length) {
    // เก็บชั้นนี้
    const current = frontier.filter((id) => !seen.has(id));
    current.forEach((id) => seen.add(id));
    result.push(...current);

    // หา children ของ “ชั้น” นี้ในคำสั่งเดียว
    const children = await prisma.skill.findMany({
      where: { parentId: { in: current } },
      select: { id: true },
    });
    frontier = children.map((c) => c.id);
  }
  return result;
}

// เดินขึ้นหาตัวรากจริง หากผู้ใช้ส่ง id ของโหนดกลางมา
async function resolveRootSkillId(skillId: number): Promise<number> {
  let cur = await prisma.skill.findUnique({
    where: { id: skillId },
    select: { id: true, parentId: true },
  });
  if (!cur) throw new Error(`Skill ${skillId} not found`);
  while (cur.parentId != null) {
    cur = await prisma.skill.findUnique({
      where: { id: cur.parentId },
      select: { id: true, parentId: true },
    });
    if (!cur) break;
  }
  return cur?.id ?? skillId;
}

// expected เฉพาะ CLO บนโหนดนี้ที่นิสิตคนนี้ “เกี่ยวข้อง” (ใช้ skill_collections เป็น mask; ไม่ใช้ gainedLevel)
function expectedFromClosHereForStudent(
  skill: Skill,
  studentId: number,
): number[] {
  const xs: number[] = [];
  for (const clo of skill.clos ?? []) {
    const related = (clo.skill_collections ?? []).some(
      (sc) => sc.studentId === studentId,
    );
    if (!related) continue;
    if (isNum(clo.expectSkillLevel)) xs.push(clo.expectSkillLevel);
  }
  return xs;
}

// รวม expected แบบ “ไล่ชั้น” ต่อคน สำหรับโหนดหนึ่ง
function aggregateExpectedAtNodeForStudent(
  skill: Skill,
  childrenMap: Map<number | null, Skill[]>,
  studentId: number,
): number | null {
  const kids = childrenMap.get(skill.id) ?? [];
  const childExpVals = kids
    .map((k) => aggregateExpectedAtNodeForStudent(k, childrenMap, studentId))
    .filter(isNum) as number[];
  const selfExpVals = expectedFromClosHereForStudent(skill, studentId);
  const pool = [...childExpVals, ...selfExpVals];
  return modeThenMax(pool);
}

async function fetchSubtreeWithClosAndMask(
  rootId: number,
  studentIds: number[],
): Promise<Skill[]> {
  const ids = await findAllDescendants(rootId);
  const skills = await prisma.skill.findMany({
    where: { id: { in: ids } },
    include: {
      clos: {
        include: {
          skill_collections: {
            where: { studentId: { in: studentIds } },
            select: { studentId: true }, // ใช้เป็น mask เท่านั้น
          },
        },
      },
    },
    orderBy: { id: 'asc' },
  });
  return skills as Skill[];
}

async function fetchAssessmentsForRoot(
  rootId: number,
  studentIds: number[],
): Promise<SkillAssessment[]> {
  if (!studentIds.length) return [];
  const assessments = await prisma.skill_assessment.findMany({
    where: { skillId: rootId, studentId: { in: studentIds } },
    select: {
      skillId: true,
      studentId: true,
      curriculumLevel: true,
      companyLevel: true,
      finalLevel: true,
    },
  });
  return assessments as SkillAssessment[];
}

export async function findStudentsTargetSkillLevel(
  skillId: number,
  targetLevel: 'on' | 'above' | 'below' | 'all',
  yearCode: string,
  page: number = 1,
  limit: number = 10,
  search?: string,
) {
  const take = Math.max(1, Number(limit) || 10);
  const currPage = Math.max(1, Number(page) || 1);
  const skip = (currPage - 1) * take;

  // 1) ยืนยัน root
  const rootId = await resolveRootSkillId(skillId);

  // 2) กรอง candidate students (มี assessment ของ root + เงื่อนไขปี/ค้นหา)
  const studentBaseWhere: Prisma.studentWhereInput = {
    ...(yearCode ? { code: { startsWith: yearCode } } : {}),
    ...(search
      ? {
          OR: [
            { thaiName: { contains: search } },
            { engName: { contains: search } },
            { code: { contains: search } },
          ],
        }
      : {}),
    AND: [{ skill_assessments: { some: { skillId: rootId } } }], // ต้องมีแถว assessment ของ root
  };

  // ดึงเฉพาะ id มาก่อน (ลด payload)
  const candidateIds = await prisma.student
    .findMany({
      where: studentBaseWhere,
      select: { id: true },
      orderBy: { id: 'asc' }, // คงลำดับสม่ำเสมอ
    })
    .then((rs) => rs.map((r) => r.id));

  if (candidateIds.length === 0) {
    return createPaginatedData([], 0, currPage, take);
  }

  // 3) ดึง subtree + CLO + mask ของ candidates
  const subtreeSkills = await fetchSubtreeWithClosAndMask(rootId, candidateIds);
  const { children, byId } = buildIndex(subtreeSkills);
  const rootSkill = byId.get(rootId);
  if (!rootSkill) throw new Error(`Root skill ${rootId} not found in subtree`);

  // 4) ดึง assessment ของ root/candidates
  const assessments = await fetchAssessmentsForRoot(rootId, candidateIds);
  const assessMap = new Map<number, number | null>(); // studentId -> assessed
  for (const a of assessments) {
    if (!isNum(a.studentId)) continue;
    assessMap.set(
      a.studentId!,
      pickAssessedLevel(a, ['final', 'company', 'curriculum']),
    );
    console.log('a', a);
    console.log('assessMap', assessMap);
  }

  // 5) คัดกรองตาม targetLevel (expected ต่อคน)
  const passedIds: number[] = [];
  for (const sid of candidateIds) {
    const expected = aggregateExpectedAtNodeForStudent(
      rootSkill as Skill,
      children as Map<number, Skill[]>,
      sid,
    );
    const assessed = assessMap.get(sid) ?? null;

    // เหมือน getSkillSummary: ถ้าไม่มี expected หรือไม่มี assessed → ข้าม
    if (!isNum(assessed)) continue;

    let isPass: boolean;

    if (!isNum(expected)) {
      // <<< NEW: ไม่มี expected (ไม่เคยได้ skillcollection) → ใช้ fallback rule
      if (targetLevel === 'all') {
        isPass = true;
      } else if (targetLevel === 'on') {
        isPass = assessed >= 1; // เปลี่ยนเป็น >= 1 ได้ถ้าต้องการ
      } else if (targetLevel === 'below') {
        isPass = assessed === 0;
      } else {
        // 'above' ทำไม่ได้เมื่อไม่มี expected
        isPass = false;
      }
    } else {
      // เดิม: มี expected → เทียบตามปกติ
      if (targetLevel === 'all') {
        isPass = true;
      } else if (targetLevel === 'on') {
        isPass = assessed === expected;
      } else if (targetLevel === 'above') {
        isPass = assessed > expected;
      } else {
        isPass = assessed < expected; // below
      }
    }
    if (isPass) passedIds.push(sid);
  }

  const total = passedIds.length;
  const pageIds = passedIds.slice(skip, skip + take);

  // 6) ดึงรายละเอียดนักเรียนเฉพาะหน้าที่คัดแล้ว (รวม assessment แถวของ root)
  const students = pageIds.length
    ? await prisma.student.findMany({
        where: { id: { in: pageIds } },
        include: {
          skill_assessments: { where: { skillId: rootId } },
        },
        orderBy: { id: 'asc' },
      })
    : [];

  return createPaginatedData(students, total, currPage, take);
}
