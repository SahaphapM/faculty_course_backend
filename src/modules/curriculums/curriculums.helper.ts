// ===============================
// Skill Summary (Hierarchical Roll-up)
// ===============================

import { LearningDomain } from 'src/enums/learning-domain.enum';
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
interface SkillCollection {
  studentId: number | null;
  gainedLevel: Level;
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

function modeThenMax(xs: readonly Level[]): Level | null {
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
function buildIndex(skills: Skill[]) {
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

/** รวม expected/gained จาก CLO ใต้สกิล “เฉพาะของนักเรียนคนนี้” */
function collectLeafValuesForStudent(
  skill: Skill,
  studentId: number,
): { expVals: Level[]; gainVals: Level[] } {
  const expVals: Level[] = [];
  const gainVals: Level[] = [];
  for (const clo of skill.clos ?? []) {
    const mine = (clo.skill_collections ?? []).filter(
      (sc) => sc.studentId === studentId,
    );
    if (!mine.length) continue; // <<— คิด expected เฉพาะกรณีเด็กมีข้อมูลใน CLO นี้จริง
    if (isNum(clo.expectSkillLevel)) expVals.push(clo.expectSkillLevel);
    for (const sc of mine) gainVals.push(sc.gainedLevel);
  }
  return { expVals, gainVals };
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

  // รวมค่าจากลูก
  const childExp = childAggs.map((c) => c.expected).filter(isNum) as Level[];
  const childGain = childAggs.map((c) => c.gained).filter(isNum) as Level[];

  // รวมค่า CLO ของโหนดนี้ (ถ้ามี)
  const selfVals = collectLeafValuesForStudent(skill, studentId);

  // สร้าง "pool ของชั้นนี้" = ลูก ๆ + CLO ของตัวเอง
  const expPool: Level[] = [...childExp, ...selfVals.expVals];
  const gainPool: Level[] = [...childGain, ...selfVals.gainVals];

  const expected = modeThenMax(expPool);
  const gained = modeThenMax(gainPool);

  let category: Category = 'n/a';
  if (isNum(expected) && isNum(gained)) {
    category =
      gained > expected ? 'above' : gained === expected ? 'on' : 'below';
  }

  return {
    id: skill.id,
    name: skill.thaiName,
    domain: skill.domain,
    parentId: skill.parentId,
    depth,
    expected,
    gained,
    category,
    children: childAggs,
  };
}

/** รวมทั้ง forest (ทุก root) ของนักเรียน 1 คน */
function aggregateStudentForest(skills: Skill[], studentId: number): AggNode[] {
  const { children, roots } = buildIndex(skills);
  return roots.map((r) => aggregateNodeForStudent(r, children, studentId, 0));
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
            select: { studentId: true, gainedLevel: true },
          },
        },
      },
    },
  });
}

// ---------- สรุปผล per-root (ทุกนักเรียน) ----------
function summarizeAcrossStudentsHierarchical(
  skills: Skill[],
  studentIds: number[],
): RootSummary[] {
  const { roots } = buildIndex(skills);

  // เตรียมโครงสรุป
  const base = roots.map((r) => ({
    skillName: r.thaiName,
    skillId: r.id,
    domain: r.domain,
    totalStudent: studentIds.length,
    buckets: {
      above: { count: 0, studentIds: [] as number[] },
      on: { count: 0, studentIds: [] as number[] },
      below: { count: 0, studentIds: [] as number[] },
    },
  }));

  // วนทีละนักเรียน → roll-up แบบไล่ชั้น → อัปเดต bucket ของแต่ละ root
  for (const sid of studentIds) {
    const forest = aggregateStudentForest(skills, sid);
    for (const rootNode of forest) {
      const dest = base.find((b) => b.skillId === rootNode.id)!;
      if (
        rootNode.category === 'above' ||
        rootNode.category === 'on' ||
        rootNode.category === 'below'
      ) {
        dest.buckets[rootNode.category].count += 1;
        dest.buckets[rootNode.category].studentIds.push(sid);
      }
      // ถ้า 'n/a' จะไม่นับรวม (ข้อมูลไม่พอ)
    }
  }

  // จัดรูปแบบ levelSummary (มีค่า 0 ก็แสดง)
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

  // debug เฉพาะรายคน/ราก (ถ้าระบุมา)
  if (debug?.studentId && debug?.rootSkillId) {
    const forest = aggregateStudentForest(skills, debug.studentId);
    for (const root of forest) printAggTree(root);
  }

  // รายงานสรุป per-root สำหรับนักเรียนทั้งหมด
  return summarizeAcrossStudentsHierarchical(skills, studentIds);
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
