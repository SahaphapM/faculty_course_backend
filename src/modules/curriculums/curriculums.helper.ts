// ===============================
// Skill Summary (Hierarchical Roll-up)
// ===============================

import { LearningDomain } from 'src/enums/learning-domain.enum';
import { SkillAssessment } from 'src/generated/nestjs-dto/skillAssessment.entity';
import { SkillCollection } from 'src/generated/nestjs-dto/skillCollection.entity';
import { PrismaService } from 'src/prisma/prisma.service';

const prisma = new PrismaService();

// ---------- Types ----------
type Level = number;
type Category = 'above' | 'on' | 'below' | 'n/a';

interface Skill {
  id: number;
  thaiName: string;
  domain: string;
  parentId: number | null;
  clos?: Clo[];
}
interface Clo {
  id: number;
  expectSkillLevel: Level | null;
  skill_collections?: SkillCollection[];
}

interface RootSummary {
  skillName: string;
  skillId: number;
  domain: string;
  totalStudent: number;
  levelSummary: Array<{
    category: 'above' | 'on' | 'below';
    count: number;
    studentIds: number[];
  }>;
}

// ---------- Small utils ----------
const isNum = (v: unknown): v is number =>
  typeof v === 'number' && !Number.isNaN(v);

export function modeThenMax(xs: readonly Level[]): Level | null {
  if (!xs.length) return null;
  const f = new Map<Level, number>();
  for (const x of xs) f.set(x, (f.get(x) ?? 0) + 1);
  let maxC = -1,
    modes: Level[] = [];
  for (const [x, c] of f.entries()) {
    if (c > maxC) {
      maxC = c;
      modes = [x];
    } else if (c === maxC) modes.push(x);
  }
  return modes.length === 1 ? modes[0] : Math.max(...modes);
}

// ---------- Tree helpers ----------
export function buildIndex(skills: Skill[]) {
  const byId = new Map<number, Skill>(skills.map((s) => [s.id, s]));
  const children = new Map<number | null, Skill[]>();
  for (const s of skills) {
    const key = s.parentId;
    const arr = children.get(key) ?? [];
    arr.push(s);
    children.set(key, arr);
  }
  const roots = children.get(null) ?? [];
  return { byId, children, roots };
}

function buildExpectedForestForStudent(
  skills: Skill[],
  studentId: number,
): {
  forest: AggNode[];
  expectedByRoot: Map<number, Level | null>;
  gainedByRoot: Map<number, Level | null>;
} {
  const { children, roots } = buildIndex(skills);
  const forest = roots.map((r) =>
    aggregateNodeForStudent(r, children, studentId, 0),
  );
  const expectedByRoot = new Map<number, Level | null>(
    forest.map((n) => [n.id, n.expected]),
  );
  const gainedByRoot = new Map<number, Level | null>(
    forest.map((n) => [n.id, n.gained]),
  );

  return { forest, expectedByRoot, gainedByRoot };
}

/** รวม expected/gained จาก CLO ใต้สกิล “เฉพาะของนักเรียนคนนี้” */
/** expected เฉพาะ CLO ใต้โหนดนี้ที่นักเรียนคนนี้เกี่ยวข้อง (mask ด้วย skill_collections) */
function collectExpectedForStudentOnNode(
  skill: Partial<Skill>,
  studentId: number,
): Level[] {
  const xs: Level[] = [];
  for (const clo of skill.clos ?? []) {
    const related = (clo.skill_collections ?? []).some(
      (sc) => sc.studentId === studentId,
    );
    if (!related) continue;
    if (isNum(clo.expectSkillLevel)) xs.push(clo.expectSkillLevel);
  }
  return xs;
}

function collectGainedForStudentOnNode(
  skill: Partial<Skill>,
  studentId: number,
): Level[] {
  const xs: Level[] = [];
  for (const clo of skill.clos ?? []) {
    for (const sc of clo.skill_collections ?? []) {
      if (sc.studentId === studentId && isNum(sc.gainedLevel)) {
        xs.push(sc.gainedLevel);
      }
    }
  }
  return xs;
}

export type AggNode = {
  id: number;
  name: string;
  domain: string;
  parentId: number | null;
  depth: number;
  expected: Level | null; // ค่าที่รวม “ระดับนี้” แล้ว (จากลูก + clo ของตัวเอง)
  gained: Level | null;
  category: Category;
  children: AggNode[];
};

function aggregateNodeForStudent(
  skill: Skill,
  childrenMap: Map<number | null, Skill[]>,
  studentId: number,
  depth: number,
): AggNode {
  const kids = childrenMap.get(skill.id) ?? [];
  const childAggs = kids.map((k) =>
    aggregateNodeForStudent(k, childrenMap, studentId, depth + 1),
  );

  // รวมค่าจากลูก (expected เท่านั้น)
  const childExpected = childAggs
    .map((c) => c.expected)
    .filter(isNum) as Level[];

  // expected จาก CLO ของโหนดนี้ (เฉพาะที่เด็กเกี่ยวข้อง)
  const selfExpectedVals = collectExpectedForStudentOnNode(skill, studentId);

  // pool ของ "ชั้นนี้"
  const expectedPool: Level[] = [...childExpected, ...selfExpectedVals];
  const expected = modeThenMax(expectedPool);

  // gained ของ node นี้ (คล้าย expected แต่เอามาจาก gainedLevel)
  const childGained = childAggs.map((c) => c.gained).filter(isNum) as Level[];
  const selfGainedVals = collectGainedForStudentOnNode(skill, studentId);
  const gainedPool: Level[] = [...childGained, ...selfGainedVals];
  const gained = gainedPool.length ? Math.max(...gainedPool) : null;

  // gained/category ไม่คำนวณที่ชั้นกลาง (จะไปเทียบตอนสรุปด้วย assessment)
  return {
    id: skill.id,
    name: skill.thaiName,
    domain: skill.domain,
    parentId: skill.parentId,
    depth,
    expected,
    gained,
    category: 'n/a',
    children: childAggs,
  };
}

// ---------- Public APIs (DB) ----------
export function getSkillDomains(skillType: string): LearningDomain[] {
  return skillType === 'soft'
    ? [LearningDomain.Affective, LearningDomain.Ethics]
    : [LearningDomain.Cognitive, LearningDomain.Psychomotor];
}

export async function getStudentIds(
  curriculumId: number,
  yearCode: string,
): Promise<number[]> {
  const students = await prisma.student.findMany({
    where: {
      curriculumId,
      ...(yearCode && { code: { startsWith: yearCode } }),
    },
    select: { id: true },
  });
  return students.map((s) => s.id);
}

export async function fetchSkillsWithCollections(
  curriculumId: number,
  domains: LearningDomain[],
  studentIds: number[],
) {
  return prisma.skill.findMany({
    where: {
      curriculumId,
      ...(domains.length && { domain: { in: domains } }),
    },
    include: {
      clos: {
        include: {
          skill_collections: {
            where: { studentId: { in: studentIds } },
            select: { studentId: true, gainedLevel: true }, // << ใช้เป็น mask อย่างเดียว
          },
        },
      },
    },
  });
}

// ---------- Service entry (พร้อมดีบักทางเลือก) ----------
export async function getSkillSummary(
  curriculumId: number,
  yearCode: string,
  skillType: string,
  debug?: { studentId?: number; rootSkillId?: number }, // optional ดีบัก
) {
  const domains = getSkillDomains(skillType);
  const studentIds = await getStudentIds(curriculumId, yearCode);
  const skills = await fetchSkillsWithCollections(
    curriculumId,
    domains,
    studentIds,
  );

  // ดึง assessment เฉพาะ root
  const { roots } = buildIndex(skills as unknown as Skill[]);
  const rootIds = roots.map((r) => r.id);
  const assessments = await fetchRootAssessments(rootIds, studentIds);

  // console.log('=== [DEBUG] Assessments ===');
  // console.log(assessments.filter((a) => a.studentId === debug?.studentId));

  // debug (optional): expected tree ของคนที่ระบุ
  if (debug?.studentId && debug?.rootSkillId) {
    console.log('=== [DEBUG] Expected Tree ===');
    const student = await prisma.student.findUnique({
      where: { id: debug.studentId },
    });

    console.log('Student:', student?.code, student.thaiName, student.id);
    const { forest } = buildExpectedForestForStudent(
      skills as unknown as Skill[],
      debug.studentId,
    );
    for (const root of forest) printAggTree(root); // จะพิมพ์ E: ที่ทุกชั้น
    // ดึง assessment เฉพาะ root
  }

  // สรุป per-root โดยเทียบ "assessment vs expected (per-student)"
  return summarizeAcrossStudentsUsingAssessments(
    skills as unknown as Skill[],
    roots,
    studentIds,
    assessments,
  );
}

// ---------- Debug helpers ----------
export function printAggTree(node: AggNode, indent = '') {
  const exp = node.expected ?? '-';
  const gn = node.gained ?? '-';
  console.log(
    `${indent}- [${node.id}] ${node.name}  E:${exp}  G:${gn}  (${node.category})`,
  );
  for (const c of node.children) printAggTree(c, indent + '  ');
}

async function fetchRootAssessments(
  rootIds: number[],
  studentIds: number[],
): Promise<Partial<SkillAssessment>[]> {
  if (!rootIds.length || !studentIds.length) return [];
  return prisma.skill_assessment.findMany({
    where: {
      skillId: { in: rootIds },
      studentId: { in: studentIds },
      OR: [
        { finalLevel: { gte: 1 } },
        { companyLevel: { gte: 1 } },
        { curriculumLevel: { gte: 1 } },
      ],
    },
    select: {
      id: true,
      skillId: true,
      studentId: true,
      curriculumLevel: true,
      companyLevel: true,
      finalLevel: true,
    },
  });
}

export function pickAssessedLevel(
  assessment: Pick<
    SkillAssessment,
    'curriculumLevel' | 'companyLevel' | 'finalLevel'
  >,
  pickOrder: string[],
) {
  if (isNum(assessment.finalLevel) && assessment.finalLevel >= 1)
    return assessment.finalLevel!;
  if (
    pickOrder[0] === 'company' &&
    isNum(assessment.companyLevel) &&
    assessment.companyLevel >= 1
  )
    return assessment.companyLevel!;
  if (
    isNum(assessment.companyLevel) &&
    pickOrder.includes('company') &&
    assessment.companyLevel >= 1
  )
    return assessment.companyLevel!;
  if (isNum(assessment.curriculumLevel)) return assessment.curriculumLevel!;
  return null;
}

function summarizeAcrossStudentsUsingAssessments(
  skills: Skill[],
  roots: Skill[],
  studentIds: number[],
  assessments: Partial<SkillAssessment>[],
  pickOrder: Array<'final' | 'company' | 'curriculum'> = [
    'final',
    'company',
    'curriculum',
  ],
): RootSummary[] {
  const base = roots.map((r) => ({
    skillName: r.thaiName,
    skillId: r.id,
    domain: r.domain,
    totalStudent: 0,
    buckets: {
      above: { count: 0, studentIds: [] as number[] },
      on: { count: 0, studentIds: [] as number[] },
      below: { count: 0, studentIds: [] as number[] },
    },
  }));

  // ทำ map assessment: (rootId:studentId) -> assessedLevel
  const assessMap = new Map<string, number | null>();
  for (const a of assessments) {
    if (!isNum(a.skillId) || !isNum(a.studentId)) continue;
    assessMap.set(
      `${a.skillId}:${a.studentId}`,
      pickAssessedLevel(a as SkillAssessment, pickOrder),
    );
  }

  // วนทีละนักเรียน → คำนวณ expectedByRoot (ต่อคน) → เทียบกับ assessment ที่ root
  for (const sid of studentIds) {
    const { expectedByRoot } = buildExpectedForestForStudent(skills, sid);
    for (const root of roots) {
      const target = expectedByRoot.get(root.id);
      const assessed = assessMap.get(`${root.id}:${sid}`);
      let bucket: 'above' | 'on' | 'below';
      // ไม่มี assessment ก็ข้ามเหมือนเดิม
      if (!isNum(assessed)) continue;
      if (!isNum(target)) continue;

      // เทียบปกติเมื่อมี expected
      bucket =
        assessed > target ? 'above' : assessed === target ? 'on' : 'below';

      const dest = base.find((b) => b.skillId === root.id)!;
      dest.buckets[bucket].count += 1;
      dest.buckets[bucket].studentIds.push(sid);
      dest.totalStudent += 1;
    }
  }

  return base.map((b) => ({
    skillName: b.skillName,
    skillId: b.skillId,
    domain: b.domain,
    totalStudent: b.totalStudent,
    levelSummary: (['above', 'on', 'below'] as const).map((cat) => ({
      category: cat,
      count: b.buckets[cat].count,
      studentIds: b.buckets[cat].studentIds,
    })),
  }));
}
