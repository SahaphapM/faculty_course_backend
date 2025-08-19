import { Injectable } from '@nestjs/common';
import { SkillAssessment } from 'src/generated/nestjs-dto/skillAssessment.entity';
import { PrismaService } from 'src/prisma/prisma.service';

type SkillFull = {
  id: number;
  engName: string | null;
  thaiName: string | null;
  domain: string | null;
  parentId: number | null;
};

export type SkillNode = {
  id: number;
  name: string | null;
  domain: string | null;
  parentId: number | null;
  gained: number;
  subskills: SkillNode[];
};

// เดิมของคุณ
type SkillCollectionLite = {
  id?: number;
  gainedLevel: number;
  clo?: { skill?: { id: number } | null } | null;
};

type RootSkillLite = {
  id: number;
  thaiName: string;
  engName: string;
  domain: string;
  parentId: number | null;
};

@Injectable()
export class SkillCollectionsHelper {
  constructor(private prisma: PrismaService) {}

  async syncStudentSkillAssessments(
    studentId: number,
    rootSkills: RootSkillLite[],
    skillCollections: SkillCollectionLite[],
  ) {
    // เก็บ skillId ทั้งหมดจาก skillCollections
    const skillIds = new Set<number>();
    skillCollections.forEach((sc) => {
      const skillId = sc.clo?.skill?.id;
      if (skillId) skillIds.add(skillId);
    });

    const relatedSkills = await this.fetchParents(Array.from(skillIds));

    // อัด rootSkills เข้า map ให้เป็นชนิดเดียวกับ SkillFull
    for (const r of rootSkills) {
      if (!relatedSkills.has(r.id)) {
        relatedSkills.set(r.id, {
          id: r.id,
          thaiName: r.thaiName ?? null,
          engName: r.engName ?? null,
          domain: r.domain ?? null,
          parentId: r.parentId ?? null,
        });
      }
    }

    // สร้าง skillLevelMap (เก็บ gained level ของทุก skill ที่ student มี)
    const skillLevelMap = new Map<number, number>();
    skillCollections.forEach((sc) => {
      const skillId = sc.clo?.skill?.id;
      if (skillId) {
        const current = skillLevelMap.get(skillId) || 0;
        skillLevelMap.set(skillId, Math.max(current, sc.gainedLevel));
      }
    });

    // Build nodes พร้อม name/domain
    const skillMap = new Map<number, SkillNode>();
    for (const s of relatedSkills.values()) {
      skillMap.set(s.id, {
        id: s.id,
        name: s.thaiName ?? null,
        domain: s.domain ?? null,
        parentId: s.parentId ?? null,
        gained: skillLevelMap.get(s.id) ?? 0,
        subskills: [],
      });
    }

    // ทำเป็น tree
    for (const node of skillMap.values()) {
      if (node.parentId) {
        const p = skillMap.get(node.parentId);
        if (p) p.subskills.push(node);
      }
    }

    // คำนวณ gained และจัดเรียง แล้วเตรียมผลลัพธ์สำหรับ return
    const result: SkillNode[] = [];
    for (const r of rootSkills) {
      const rootNode = skillMap.get(r.id);
      if (!rootNode) continue;
      const g = this.fillGained(rootNode);
      rootNode.gained = g ?? rootNode.gained ?? 0;
      result.push(rootNode);
      this.printTree(rootNode);
    }

    // สร้าง/อัปเดต skill_assessment
    for (const rootSkill of rootSkills) {
      const rootNode = skillMap.get(rootSkill.id);
      const curriculumLevel = rootNode?.gained || 0;

      await this.prisma.skill_assessment.upsert({
        where: {
          skillId_studentId: { skillId: rootSkill.id, studentId },
        },
        update: {
          curriculumLevel,
          finalLevel: curriculumLevel,
        },
        create: {
          studentId,
          skillId: rootSkill.id,
          curriculumLevel,
          companyLevel: 0,
          finalLevel: curriculumLevel,
        },
      });
    }

    return skillMap;
  }

  async skillTree(
    skillCollections: SkillCollectionLite[],
    skill_assessments: SkillAssessment[],
  ) {
    const rootSkills = skill_assessments.map((sa) => sa.skill);

    // เก็บ skillId ทั้งหมดจาก skillCollections
    const skillIds = new Set<number>();
    skillCollections.forEach((sc) => {
      const skillId = sc.clo?.skill?.id;
      if (skillId) skillIds.add(skillId);
    });

    const relatedSkills = await this.fetchParents(Array.from(skillIds));

    // สร้าง skillLevelMap (เก็บ gained level ของทุก skill ที่ student มี)
    const skillLevelMap = new Map<number, number>();
    skillCollections.forEach((sc) => {
      const skillId = sc.clo?.skill?.id;
      if (skillId) {
        const current = skillLevelMap.get(skillId) || 0;
        skillLevelMap.set(skillId, Math.max(current, sc.gainedLevel));
      }
    });

    // Build nodes พร้อม name/domain
    const skillMap = new Map<number, SkillNode>();
    for (const s of relatedSkills.values()) {
      skillMap.set(s.id, {
        id: s.id,
        name: s.thaiName ?? null,
        domain: s.domain ?? null,
        parentId: s.parentId ?? null,
        gained: skillLevelMap.get(s.id) ?? 0,
        subskills: [],
      });
    }

    // ทำเป็น tree
    for (const node of skillMap.values()) {
      if (node.parentId) {
        const p = skillMap.get(node.parentId);
        if (p) p.subskills.push(node);
      }
    }

    // คำนวณ gained และจัดเรียง แล้วเตรียมผลลัพธ์สำหรับ return
    const result: SkillNode[] = [];
    for (const r of rootSkills) {
      const rootNode = skillMap.get(r.id);
      if (!rootNode) continue;
      const g = this.fillGained(rootNode);
      rootNode.gained = g ?? rootNode.gained ?? 0;
      // this.sortTree(rootNode); // ออปชัน: ให้ “เรียง” ตามชื่อ
      result.push(rootNode);
      // this.printTree(rootNode);
    }

    for (const sa of skill_assessments) {
      if (
        !skillMap.has(sa.skillId) &&
        this.getLevelFromSkillAssessment(sa) !== null
      ) {
        skillMap.set(sa.skillId, {
          id: sa.id,
          name: sa.skill.thaiName,
          domain: sa.skill.domain,
          parentId: sa.skill.parentId,
          gained: this.getLevelFromSkillAssessment(sa),
          subskills: [],
        });
      }
      const node = skillMap.get(sa.skillId);
      if (node) {
        node.id = sa.id;
        node.gained = this.getLevelFromSkillAssessment(sa) || node.gained;
      }
    }

    // console.log('=== [DEBUG] Skill Map ===');
    // console.dir(skillMap, { depth: 10 });

    return skillMap;
  }

  getLevelFromSkillAssessment(sa: SkillAssessment) {
    if (sa.finalLevel && sa.finalLevel > 0) {
      return sa.finalLevel;
    }
    if (sa.companyLevel && sa.companyLevel > 0) {
      return sa.companyLevel;
    }
    if (sa.curriculumLevel && sa.curriculumLevel > 0) {
      return sa.curriculumLevel;
    }
    return null;
  }

  async fetchParents(
    ids: number[],
    relatedSkills = new Map<number, SkillFull>(), // << ตัวสะสม
  ): Promise<Map<number, SkillFull>> {
    if (!ids.length) return relatedSkills;

    const skills: SkillFull[] = await this.prisma.skill.findMany({
      where: { id: { in: ids } },
      include: { parent: { select: { id: true } } },
    });

    const newParentIds: number[] = [];

    for (const skill of skills) {
      if (!relatedSkills.has(skill.id)) {
        relatedSkills.set(skill.id, skill);
        const pid = skill.parentId ?? null;
        if (pid && !relatedSkills.has(pid)) {
          newParentIds.push(pid);
        }
      }
    }

    if (newParentIds.length > 0) {
      await this.fetchParents(newParentIds, relatedSkills); // ใช้ตัวสะสมเดิม
    }
    return relatedSkills;
  }

  // ฟังก์ชัน recursive fill gained level
  fillGained(node: any): number | undefined {
    if (!node.subskills.length) return node.gained;
    const childGained = node.subskills
      .map((child: any) => this.fillGained(child))
      .filter((x: any) => x !== undefined) as number[];

    if (childGained.length > 0) node.gained = calculateMode(childGained);
    return node.gained;
  }

  // Debug Tree
  printTree(node: any, indent = '') {
    console.log(`${indent}- Skill ${node.id} (level ${node.gained || 0})`);
    for (const child of node.subskills) {
      this.printTree(child, indent + '  ');
    }
  }
}

type SkillLite = {
  id: number;
  parentId: number | null;
  thaiName?: string | null;
  engName?: string | null;
  domain?: string | null;
};
type Tree = {
  byId: Map<number, SkillLite>;
  childrenOf: Map<number, number[]>;
  parentOf: Map<number, number | null>;
  rootIds: number[];
};

const treeCache = new Map<number, Tree>(); // key = curriculumId

export async function getSkillTree(
  curriculumId: number,
  client: any,
): Promise<Tree> {
  const cached = treeCache.get(curriculumId);
  if (cached) return cached;

  const skills: SkillLite[] = await client.skill.findMany({
    where: { curriculumId },
    select: {
      id: true,
      parentId: true,
      thaiName: true,
      engName: true,
      domain: true,
    },
  });

  const byId = new Map<number, SkillLite>();
  const childrenOf = new Map<number, number[]>();
  const parentOf = new Map<number, number | null>();
  const rootIds: number[] = [];

  for (const s of skills) {
    byId.set(s.id, s);
    parentOf.set(s.id, s.parentId ?? null);
    if (s.parentId) {
      const arr = childrenOf.get(s.parentId) ?? [];
      arr.push(s.id);
      childrenOf.set(s.parentId, arr);
    } else {
      rootIds.push(s.id);
    }
  }
  const tree = { byId, childrenOf, parentOf, rootIds };
  treeCache.set(curriculumId, tree);
  return tree;
}

function calculateMode(arr: number[]): number {
  if (arr.length === 0) return 0;
  const count = new Map<number, number>();
  for (const n of arr) count.set(n, (count.get(n) ?? 0) + 1);
  const max = Math.max(...count.values());
  const winners = [...count.entries()]
    .filter(([, c]) => c === max)
    .map(([n]) => n);
  return Math.max(...winners);
}

// ไต่หา root (ของ leaf รายตัว)
export function findRootOf(tree: Tree, leafId: number): number {
  let cur: number | null | undefined = leafId;
  while (cur != null) {
    const p = tree.parentOf.get(cur) ?? null;
    if (p == null) return cur;
    cur = p;
  }
  return leafId; // fallback
}

// เก็บใบไม้ทั้งหมดใต้ node (memoize ได้)
export function collectDescendantLeaves(
  tree: Tree,
  nodeId: number,
  memo = new Map<number, number[]>(),
): number[] {
  if (memo.has(nodeId)) return memo.get(nodeId)!;
  const kids = tree.childrenOf.get(nodeId) ?? [];
  if (kids.length === 0) {
    memo.set(nodeId, [nodeId]);
    return [nodeId];
  }
  const out: number[] = [];
  for (const k of kids) out.push(...collectDescendantLeaves(tree, k, memo));
  memo.set(nodeId, out);
  return out;
}

// โพรพาเกตเฉพาะกิ่งที่แตะ (post-order)
export function propagateSubtree(
  tree: Tree,
  rootId: number,
  leafLevels: Map<number, number>,
  memo = new Map<number, number>(),
): number {
  if (memo.has(rootId)) return memo.get(rootId)!;
  const kids = tree.childrenOf.get(rootId) ?? [];
  if (kids.length === 0) {
    const v = leafLevels.get(rootId) ?? 0;
    memo.set(rootId, v);
    return v;
  }
  const childVals = kids.map((id) =>
    propagateSubtree(tree, id, leafLevels, memo),
  );
  const v = calculateMode(childVals);
  memo.set(rootId, v);
  return v;
}
