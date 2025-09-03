// skill-import.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type ImportRow = { studentCode: string; gainedLevel: number };
type DebugOptions = {
  enabled?: boolean; // เปิดปิดโหมด debug
  maxStudents?: number; // จะ trace กี่คน (ค่าเริ่มต้น 3)
  includeNames?: boolean; // log ชื่อสกิลด้วยไหม (ค่าเริ่มต้น true)
};

@Injectable()
export class SkillImportService {
  private readonly logger = new Logger(SkillImportService.name); // <— logger
  constructor(private readonly prisma: PrismaService) {}

  /**
   * PART 1: เตรียมข้อมูล + upsert skill_collection (no raw)
   * - ตรวจสอบ course/clo
   * - ensure students
   * - อ่าน skill_collection เดิมของ CLO นี้
   * - สร้างใหม่ด้วย createMany และอัปเดตด้วย update รายแถว (batch)
   *
   * หมายเหตุ: ส่วนคำนวณ tree และอัปเดต assessment จะอยู่ "ส่วนที่ 2+" (ยังไม่ใส่ในเมธอดนี้)
   */
  async importSkillCollections(
    courseId: number,
    cloId: number,
    studentScoreList: ImportRow[],
    debug?: DebugOptions,
  ) {
    const dbg = {
      enabled: false,
      maxStudents: 3,
      includeNames: true,
      ...debug,
    };
    // 0) ตรวจสอบ course & clo
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
    if (!clo || !clo.skillId) throw new NotFoundException('CLO not found');

    const expect = clo.expectSkillLevel ?? 0;

    // 1) เตรียม student ids แบบแบตช์
    const codes = Array.from(
      new Set(studentScoreList.map((s) => s.studentCode)),
    );
    if (codes.length === 0) {
      return { imported: 0, created: 0, updated: 0 };
    }

    // สร้าง student ถ้ายังไม่มี (ตาม curriculum/branch ของ course)
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
    const codeToId = new Map(students.map((s) => [s.code, s.id]));
    const studentIds = students.map((s) => s.id);

    // 2) อ่าน skill_collection เดิมของ CLO นี้สำหรับนิสิตชุดนี้
    const existing = await this.prisma.skill_collection.findMany({
      where: {
        courseId: course.id,
        cloId: clo.id,
        studentId: { in: studentIds },
      },
      select: {
        id: true,
        studentId: true,
        gainedLevel: true,
        passed: true,
      },
    });

    // map: studentId -> record
    const existingByStudentId = new Map(existing.map((e) => [e.studentId!, e]));

    // 3) เตรียม payload สำหรับ create / update (ไม่ใช้ raw)
    const toCreate: Array<{
      studentId: number;
      courseId: number;
      cloId: number;
      gainedLevel: number;
      passed: boolean;
    }> = [];

    const toUpdate: Array<{
      id: number;
      gainedLevel: number;
      passed: boolean;
    }> = [];

    for (const { studentCode, gainedLevel } of studentScoreList) {
      const sid = codeToId.get(studentCode);
      if (!sid) continue; // กัน edge case

      const normalizedLevel = Math.max(0, Math.floor(gainedLevel || 0));
      const passed = normalizedLevel >= expect;

      const found = existingByStudentId.get(sid);
      if (!found) {
        toCreate.push({
          studentId: sid,
          courseId: course.id,
          cloId: clo.id,
          gainedLevel: normalizedLevel,
          passed,
        });
      } else {
        // อัปเดตเฉพาะเมื่อค่าเปลี่ยน เพื่อลด write ที่ไม่จำเป็น
        if ((found.gainedLevel ?? 0) !== normalizedLevel) {
          toUpdate.push({
            id: found.id,
            gainedLevel: normalizedLevel,
            passed,
          });
        }
      }
    }

    // 4) เขียนลงฐานข้อมูลใน transaction เดียว
    const result = await this.prisma.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;

      if (toCreate.length) {
        const { count } = await tx.skill_collection.createMany({
          data: toCreate,
          skipDuplicates: true,
        });
        created = count;
      }

      if (toUpdate.length) {
        // batch updates เพื่อลดรอบ await
        const BATCH = 200;
        for (let i = 0; i < toUpdate.length; i += BATCH) {
          const chunk = toUpdate.slice(i, i + BATCH);
          await Promise.all(
            chunk.map((u) =>
              tx.skill_collection.update({
                where: { id: u.id },
                data: { gainedLevel: u.gainedLevel, passed: u.passed },
              }),
            ),
          );
        }
        updated = toUpdate.length;
      }

      return { created, updated };
    });

    // NOTE: ตอนนี้เสร็จ “ส่วนที่ 1” (skill_collection พร้อม)
    // ส่วนที่ 2–4 จะ: โหลด subtree, รวมคะแนน bottom-up, upsert skill_assessment ที่ root

    // ... หลังจบการเขียน skill_collection ใน transaction (หรือจะทำต่อใน tx เดียวกันก็ได้)
    const rootId = await getRootSkillId(this.prisma, clo.skillId!);
    const { childrenByParent, postOrder, leafIds } = await loadSubtree(
      this.prisma,
      rootId,
    );

    // ✅ ถ้าไม่มีใบเลย → ให้ root เป็นใบ
    const effectiveLeafIds = leafIds.length ? leafIds : [rootId];

    // (ถ้าเปิดดีบัก แสดงผล leaf ที่ใช้จริง)
    if (dbg.enabled) {
      const allNodeIds = collectAllNodeIds(childrenByParent, rootId);
      const skillNameMap = await getSkillNames(this.prisma, allNodeIds);
      this.logger.debug(
        `leafIds (effective): ${effectiveLeafIds.map((id) => fmtNode(id, skillNameMap)).join(', ')}`,
      );
    }

    // ===== [DEBUG] โครงสร้างต้นไม้ =====
    let skillNameMap: Map<number, string> | undefined;
    if (dbg.enabled && dbg.includeNames) {
      const allNodeIds = collectAllNodeIds(childrenByParent, rootId);
      skillNameMap = await getSkillNames(this.prisma, allNodeIds);
      const ascii = renderAsciiTree(rootId, childrenByParent, skillNameMap);
      this.logger.debug(
        `Skill Tree (root=${fmtNode(rootId, skillNameMap)}):\n${ascii}`,
      );
      this.logger.debug(
        `postOrder: ${postOrder.map((id) => fmtNode(id, skillNameMap)).join(' → ')}`,
      );
      this.logger.debug(
        `leafIds: ${leafIds.map((id) => fmtNode(id, skillNameMap)).join(', ')}`,
      );
    }

    // เก็บไว้ใช้ในส่วนที่ 3 สำหรับคำนวณ bottom-up

    // คำนวณทีละชั้นจากใบ → พ่อ → ... → root ต่อ "นิสิตแต่ละคน"
    const perStudentRoot = await computeRootLevelsForStudents(
      this.prisma,
      studentIds,
      effectiveLeafIds,
      postOrder,
      childrenByParent,
      rootId,
    );

    // ===== [DEBUG] Trace การคำนวณทีละชั้น (สุ่ม/เลือกรายตัวอย่าง) =====
    if (dbg.enabled) {
      const sidToCode = new Map(students.map((s) => [s.id, s.code]));
      // เตรียมคะแนนใบต่อคน (ใช้ร่วมกับการ trace)
      const perStudentLeaf = await buildPerStudentLeafLevels(
        this.prisma,
        studentIds,
        leafIds,
      );

      const sample = perStudentRoot.slice(
        0,
        Math.min(dbg.maxStudents!, perStudentRoot.length),
      );
      for (const { studentId, rootLevel } of sample) {
        const code = sidToCode.get(studentId);
        this.logger.debug(
          `\n[TRACE] Student ${code ?? studentId} — compute levels`,
        );
        const steps: string[] = [];
        const leaf = perStudentLeaf.get(studentId) ?? new Map<number, number>();

        // log ใบก่อน
        if (leaf.size === 0) {
          this.logger.debug(
            `Leaf levels: (none) -> all nodes will aggregate to 0`,
          );
        } else {
          const leafStr = [...leaf.entries()]
            .map(([id, lv]) => `${fmtNode(id, skillNameMap)}=${lv}`)
            .join(', ');
          this.logger.debug(`Leaf levels: ${leafStr}`);
        }

        // คำนวณพร้อม callback ที่จะเก็บ step ราย node
        computeNodeLevelsForStudentWithTrace(
          postOrder,
          childrenByParent,
          leaf,
          (nodeId, childIds, childLevels, agg) => {
            if (childIds.length === 0) return; // ใบ
            const childStr = childIds
              .map(
                (cid, i) => `${fmtNode(cid, skillNameMap)}=${childLevels[i]}`,
              )
              .join(', ');
            steps.push(
              `${fmtNode(nodeId, skillNameMap)} <= [ ${childStr} ] -> ${agg}`,
            );
          },
        );

        for (const line of steps) this.logger.debug(line);
        this.logger.debug(
          `ROOT ${fmtNode(rootId, skillNameMap)} = ${rootLevel}`,
        );
      }
    }

    const assessResult = await upsertRootAssessments(
      this.prisma,
      rootId,
      perStudentRoot,
      {
        debug: dbg.enabled,
        studentIdToCode: new Map(students.map((s) => [s.id, s.code])),
        skillNameMap,
      },
    );

    return {
      importedSkillCollections: toCreate.length + toUpdate.length, // จากส่วนที่ 1
      assessmentsCreated: assessResult.created,
      assessmentsUpdated: assessResult.updated,
      rootSkillId: rootId,
    };
  }
}

// === PART 2 HELPERS =========================================================
// วางไว้ไฟล์เดียวกับ service หรือแยกเป็น utils.ts แล้ว import ก็ได้

/**
 * เดินขึ้นหา root จาก skillId เริ่มต้น (ตรงๆ ไม่มี raw)
 */
export async function getRootSkillId(
  tx: PrismaService,
  startSkillId: number,
): Promise<number> {
  let cur = await tx.skill.findUnique({
    where: { id: startSkillId },
    select: { id: true, parentId: true },
  });
  if (!cur) throw new NotFoundException('Skill not found');

  while (cur.parentId) {
    cur = await tx.skill.findUnique({
      where: { id: cur.parentId },
      select: { id: true, parentId: true },
    });
    if (!cur) break;
  }
  return cur!.id;
}

/**
 * โหลด subtree ใต้ root: ได้ children map, postOrder, และ leafIds
 * แนวคิด:
 * 1) รู้ curriculumId ของ root ก่อน
 * 2) ดึง skills ทั้ง curriculum เฉพาะ field ที่ต้องใช้ (id, parentId)
 * 3) ประกอบ childrenByParent แล้ว BFS เลือกเฉพาะ node ที่อยู่ใต้ root จริง ๆ
 * 4) สร้าง postOrder (DFS) และหาใบ
 */
export async function loadSubtree(
  tx: PrismaService,
  rootId: number,
): Promise<{
  childrenByParent: Map<number, number[]>;
  postOrder: number[];
  leafIds: number[];
}> {
  const root = await tx.skill.findUnique({
    where: { id: rootId },
    select: { id: true, curriculumId: true },
  });
  if (!root) throw new NotFoundException('Root skill not found');

  // ดึงเฉพาะ fields ที่จำเป็น ลด I/O
  const allInCurriculum = await tx.skill.findMany({
    where: { curriculumId: root.curriculumId },
    select: { id: true, parentId: true },
  });

  // สร้าง children map ทั่ว curriculum ก่อน
  const childrenByParent = new Map<number, number[]>();
  for (const s of allInCurriculum) {
    if (s.parentId == null) continue;
    if (!childrenByParent.has(s.parentId)) childrenByParent.set(s.parentId, []);
    childrenByParent.get(s.parentId)!.push(s.id);
  }

  // เลือกเฉพาะกิ่งที่อยู่ใต้ root (BFS/DFS ก็ได้)
  const inSubtree = new Set<number>();
  const stack = [rootId];
  while (stack.length) {
    const u = stack.pop()!;
    if (inSubtree.has(u)) continue;
    inSubtree.add(u);
    for (const v of childrenByParent.get(u) ?? []) {
      stack.push(v);
    }
  }

  // prune: ให้ childrenByParent มีเฉพาะ node ใน subtree
  for (const [p, arr] of Array.from(childrenByParent.entries())) {
    if (!inSubtree.has(p)) {
      childrenByParent.delete(p);
      continue;
    }
    childrenByParent.set(
      p,
      arr.filter((id) => inSubtree.has(id)),
    );
  }

  // หาใบ (ไม่มีลูก) — ไม่นับ root ถ้า root ไม่มีลูก (แล้วไปคำนวณต่อได้เลย)
  const leafIds: number[] = [];
  for (const id of inSubtree) {
    const ch = childrenByParent.get(id) ?? [];
    if (ch.length === 0 && id !== rootId) leafIds.push(id);
  }

  // postOrder: ลูกมาก่อนพ่อ → ใช้สำหรับ bottom-up aggregate
  const postOrder: number[] = [];
  const seen = new Set<number>();
  const dfs = (u: number) => {
    seen.add(u);
    for (const v of childrenByParent.get(u) ?? []) if (!seen.has(v)) dfs(v);
    postOrder.push(u);
  };
  dfs(rootId);

  return { childrenByParent, postOrder, leafIds };
}

// === PART 3 HELPERS =========================================================
// วางไฟล์เดียวกับ service หรือแยก utils.ts แล้ว import ก็ได้

// 3.1 รวมคะแนนลูกเป็นคะแนนพ่อ: ใช้กติกา mode → max (ถ้าเสมอ)
export function aggregateModeThenMax(levels: number[]): number {
  if (!levels.length) return 0;
  const freq = new Map<number, number>();
  for (const lv of levels) freq.set(lv, (freq.get(lv) ?? 0) + 1);
  let bestLevel = 0,
    bestCount = -1;
  for (const [lv, cnt] of freq.entries()) {
    if (cnt > bestCount || (cnt === bestCount && lv > bestLevel)) {
      bestCount = cnt;
      bestLevel = lv;
    }
  }
  return bestLevel;
}

/**
 * 3.2 เตรียม "คะแนนใบ" ต่อคนใน subtree:
 * - หา CLO ที่ผูกกับ leafIds ทั้งหมด
 * - ดึง skill_collection ของนิสิตทั้งหมดกับ CLO เหล่านั้น (ทุกวิชา/คอร์ส)
 * - map ต่อคน: leafSkillId -> max(gainedLevel) (กันกรณีใบเดียวกันมาจากหลาย CLO)
 */
export async function buildPerStudentLeafLevels(
  tx: PrismaService,
  studentIds: number[],
  leafIds: number[],
): Promise<Map<number, Map<number, number>>> {
  const perStudentLeaf = new Map<number, Map<number, number>>();
  if (!leafIds.length || !studentIds.length) return perStudentLeaf;

  const clos = await tx.clo.findMany({
    where: { skillId: { in: leafIds } },
    select: { id: true, skillId: true },
  });
  if (!clos.length) return perStudentLeaf;

  const cloIdToLeafSkillId = new Map(clos.map((c) => [c.id, c.skillId!]));
  const leafCloIds = clos.map((c) => c.id);

  const cols = await tx.skill_collection.findMany({
    where: {
      studentId: { in: studentIds },
      cloId: { in: leafCloIds },
    },
    select: { studentId: true, cloId: true, gainedLevel: true },
  });

  // เก็บค่าทั้งหมดต่อใบ (ไม่สรุปทันที)
  const bag: Map<number, Map<number, number[]>> = new Map();
  for (const r of cols) {
    const sid = r.studentId!;
    const leafSkillId = cloIdToLeafSkillId.get(r.cloId!)!;
    const lv = r.gainedLevel ?? 0;

    if (!bag.has(sid)) bag.set(sid, new Map());
    const byLeaf = bag.get(sid)!;
    const arr = byLeaf.get(leafSkillId) ?? [];
    arr.push(lv);
    byLeaf.set(leafSkillId, arr);
  }

  // สรุปด้วย mode→max
  for (const [sid, byLeaf] of bag) {
    const m = new Map<number, number>();
    for (const [leafSkillId, levels] of byLeaf) {
      if (!levels.length) continue;
      m.set(leafSkillId, aggregateModeThenMax(levels));
    }
    perStudentLeaf.set(sid, m);
  }

  return perStudentLeaf;
}

/**
 * 3.3 คำนวณทีละชั้นตาม postOrder (ลูกก่อนพ่อ) ให้ได้ level ทุก node ของนิสิต 1 คน
 * - ใส่ค่าใบจาก perStudentLeaf มาก่อน
 * - ถ้า node เป็นใบแต่ไม่มีคะแนน ให้ 0
 * - ถ้า node มีลูก ให้รวมคะแนนลูกด้วย aggregateModeThenMax
 * - คืน Map<nodeId, level> (จะเอา root ไปใช้ก็หยิบจาก map นี้)
 */
export function computeNodeLevelsForStudent(
  postOrder: number[],
  childrenByParent: Map<number, number[]>,
  leafLevels: Map<number, number>,
): Map<number, number> {
  // เริ่มจากเฉพาะใบที่ "มีข้อมูลจริง" เท่านั้น
  const levelByNode = new Map<number, number>(leafLevels);

  for (const node of postOrder) {
    const children = childrenByParent.get(node) ?? [];

    if (children.length === 0) {
      // leaf: ถ้าไม่มีข้อมูล อย่าตั้งเป็น 0 — ปล่อยว่างไว้
      continue;
    }

    // รวมเฉพาะลูกที่ "มีค่า" เท่านั้น (ไม่อัด 0 แทนที่ขาด)
    const presentChildLevels = children
      .map((c) => levelByNode.get(c))
      .filter((lv): lv is number => lv !== undefined);

    if (presentChildLevels.length === 0) {
      // ไม่มีลูกที่มีข้อมูล → ยังไม่เซ็ตค่าที่ node นี้
      continue;
    }

    const agg = aggregateModeThenMax(presentChildLevels);
    levelByNode.set(node, agg);
  }

  return levelByNode;
}

/**
 * 3.4 คำนวณระดับที่ "root" ต่อคน (ใช้ทีละชั้น) แล้วคืนลิสต์พร้อมผลลัพธ์
 */
export async function computeRootLevelsForStudents(
  tx: PrismaService,
  studentIds: number[],
  leafIds: number[],
  postOrder: number[],
  childrenByParent: Map<number, number[]>,
  rootId: number,
): Promise<Array<{ studentId: number; rootLevel: number }>> {
  const perStudentLeaf = await buildPerStudentLeafLevels(
    tx,
    studentIds,
    leafIds,
  );

  const results: Array<{ studentId: number; rootLevel: number }> = [];
  for (const sid of studentIds) {
    const leaf = perStudentLeaf.get(sid) ?? new Map<number, number>();
    const levelByNode = computeNodeLevelsForStudent(
      postOrder,
      childrenByParent,
      leaf,
    );
    results.push({ studentId: sid, rootLevel: levelByNode.get(rootId) ?? 0 });
  }
  return results;
}

/**
 * Upsert skill_assessment ที่ root ต่อรายนิสิต (batch)
 * - ไม่ใช้ raw
 * - update เฉพาะ curriculumLevel/finalLevel
 * - create ใส่ companyLevel = 0
 * - เขียนเฉพาะแถวที่มีการเปลี่ยนแปลงจริง
 */
export async function upsertRootAssessments(
  tx: PrismaService,
  rootId: number,
  perStudentRoot: Array<{ studentId: number; rootLevel: number }>,
  opts?: {
    debug?: boolean;
    studentIdToCode?: Map<number, string>;
    skillNameMap?: Map<number, string>;
  },
): Promise<{ created: number; updated: number }> {
  if (!perStudentRoot.length) return { created: 0, updated: 0 };

  const dbg = !!opts?.debug;
  const logger = new Logger('SkillAssessment');
  const studentIds = perStudentRoot.map((x) => x.studentId);

  const existing = await tx.skill_assessment.findMany({
    where: { skillId: rootId, studentId: { in: studentIds } },
    select: {
      id: true,
      studentId: true,
      curriculumLevel: true,
      finalLevel: true,
    },
  });
  const existBySid = new Map(existing.map((e) => [e.studentId!, e]));

  const toCreate: Array<{
    studentId: number;
    skillId: number;
    curriculumLevel: number;
    companyLevel: number;
    finalLevel: number;
  }> = [];
  const toUpdate: Array<{
    id: number;
    studentId: number;
    curriculumLevel: number;
    finalLevel: number;
  }> = [];

  for (const row of perStudentRoot) {
    const { studentId, rootLevel } = row;
    const ex = existBySid.get(studentId);
    if (!ex) {
      toCreate.push({
        studentId,
        skillId: rootId,
        curriculumLevel: rootLevel,
        companyLevel: 0,
        finalLevel: rootLevel,
      });
    } else {
      const newCur = rootLevel,
        newFin = rootLevel;
      const sameCur = (ex.curriculumLevel ?? 0) === newCur;
      const sameFin = (ex.finalLevel ?? 0) === newFin;
      if (!sameCur || !sameFin) {
        toUpdate.push({
          id: ex.id,
          studentId,
          curriculumLevel: newCur,
          finalLevel: newFin,
        });
      }
    }
  }

  let created = 0,
    updated = 0;

  if (toCreate.length) {
    const { count } = await tx.skill_assessment.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
    created = count;
    if (dbg) {
      const rootLabel = fmtNode(rootId, opts?.skillNameMap);
      for (const c of toCreate) {
        const who = opts?.studentIdToCode?.get(c.studentId) ?? c.studentId;
        logger.debug(
          `[CREATE] ${rootLabel} -> student ${who} = ${c.finalLevel}`,
        );
      }
    }
  }

  if (toUpdate.length) {
    const BATCH = 200;
    for (let i = 0; i < toUpdate.length; i += BATCH) {
      const chunk = toUpdate.slice(i, i + BATCH);
      await Promise.all(
        chunk.map((u) =>
          tx.skill_assessment.update({
            where: { id: u.id },
            data: {
              curriculumLevel: u.curriculumLevel,
              finalLevel: u.finalLevel,
            },
          }),
        ),
      );
    }
    updated = toUpdate.length;

    if (dbg) {
      const rootLabel = fmtNode(rootId, opts?.skillNameMap);
      for (const u of toUpdate) {
        const who = opts?.studentIdToCode?.get(u.studentId) ?? u.studentId;
        logger.debug(
          `[UPDATE] ${rootLabel} -> student ${who} = ${u.finalLevel}`,
        );
      }
    }
  }

  return { created, updated };
}

// ============ LOG / DEBUG HELPERS ============

// เก็บ id ทั้ง subtree เพื่อเอาไปดึงชื่อ
function collectAllNodeIds(
  childrenByParent: Map<number, number[]>,
  rootId: number,
): number[] {
  const ids = new Set<number>();
  const stack = [rootId];
  while (stack.length) {
    const u = stack.pop()!;
    if (ids.has(u)) continue;
    ids.add(u);
    for (const v of childrenByParent.get(u) ?? []) stack.push(v);
  }
  return Array.from(ids.values());
}

// ดึงชื่อสกิลทั้งหมดที่ต้องใช้
async function getSkillNames(
  tx: PrismaService,
  ids: number[],
): Promise<Map<number, string>> {
  if (!ids.length) return new Map();
  const rows = await tx.skill.findMany({
    where: { id: { in: ids } },
    select: { id: true, thaiName: true, engName: true },
  });
  const m = new Map<number, string>();
  for (const r of rows) m.set(r.id, r.thaiName || r.engName || String(r.id));
  return m;
}

// แสดงชื่อสวย ๆ (id + name ถ้ามี)
function fmtNode(id: number, nameMap?: Map<number, string>) {
  if (!nameMap) return `#${id}`;
  const nm = nameMap.get(id);
  return nm ? `${nm}(#${id})` : `#${id}`;
}

// สร้าง ASCII tree
function renderAsciiTree(
  rootId: number,
  childrenByParent: Map<number, number[]>,
  nameMap?: Map<number, string>,
): string {
  const lines: string[] = [];
  const walk = (id: number, prefix: string, isLast: boolean) => {
    const branch = prefix ? (isLast ? '└─ ' : '├─ ') : '';
    lines.push(prefix + branch + fmtNode(id, nameMap));
    const kids = childrenByParent.get(id) ?? [];
    const nextPrefix = prefix + (prefix ? (isLast ? '   ' : '│  ') : '');
    kids.forEach((kid, idx) => {
      const last = idx === kids.length - 1;
      walk(kid, nextPrefix, last);
    });
  };
  walk(rootId, '', true);
  return lines.join('\n');
}

// เวอร์ชัน trace: จะเรียก onStep ทุกครั้งที่คำนวณ node ที่มีลูก
function computeNodeLevelsForStudentWithTrace(
  postOrder: number[],
  childrenByParent: Map<number, number[]>,
  leafLevels: Map<number, number>,
  onStep: (
    nodeId: number,
    childIds: number[],
    childLevels: number[],
    aggregated: number,
  ) => void,
): Map<number, number> {
  const levelByNode = new Map<number, number>(leafLevels);

  for (const node of postOrder) {
    const children = childrenByParent.get(node) ?? [];
    if (children.length === 0) continue; // leaf ไม่มีข้อมูล → ข้าม

    const present: Array<[number, number]> = [];
    for (const c of children) {
      const lv = levelByNode.get(c);
      if (lv !== undefined) present.push([c, lv]); // เอาเฉพาะลูกที่มีข้อมูล
    }

    if (present.length === 0) continue; // ไม่มีข้อมูลจากลูกเลย → ข้าม

    const childIds = present.map(([id]) => id);
    const childLevels = present.map(([, lv]) => lv);
    const aggregated = aggregateModeThenMax(childLevels);

    levelByNode.set(node, aggregated);
    onStep(node, childIds, childLevels, aggregated);
  }

  return levelByNode;
}
