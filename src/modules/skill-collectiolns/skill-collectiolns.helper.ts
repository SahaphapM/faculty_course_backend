import { Injectable } from '@nestjs/common';
import { LearningDomain } from 'src/enums/learning-domain.enum';
import { Skill } from 'src/generated/nestjs-dto/skill.entity';
import { Student } from 'src/generated/nestjs-dto/student.entity';
import { PrismaService } from 'src/prisma/prisma.service';

type SkillFull = {
  id: number;
  engName: string | null;
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
    console.log(
      `=== [DEBUG] Start Skill Assessment Sync for student ${studentId} ===`,
    );
    console.log('=== [DEBUG] Student ===');
    // console.log(student);

    console.log('=== [DEBUG] Root Skills ===');
    // console.log(rootSkills);

    console.log('=== [DEBUG] Skill Collections ===');
    console.log(skillCollections);

    // เก็บ skillId ทั้งหมดจาก skillCollections
    const skillIds = new Set<number>();
    skillCollections.forEach((sc) => {
      const skillId = sc.clo?.skill?.id;
      if (skillId) skillIds.add(skillId);
    });

    console.log('=== [DEBUG] Skill IDs ===');
    // console.log(skillIds);

    const relatedSkills = await this.fetchParents(Array.from(skillIds));

    console.log('=== [DEBUG] Related Skills ===');
    // console.log(relatedSkills);

    // อัด rootSkills เข้า map ให้เป็นชนิดเดียวกับ SkillFull
    for (const r of rootSkills) {
      if (!relatedSkills.has(r.id)) {
        relatedSkills.set(r.id, {
          id: r.id,
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
        name: s.engName ?? null,
        domain: s.domain ?? null,
        parentId: s.parentId ?? null,
        gained: skillLevelMap.get(s.id) ?? 0,
        subskills: [],
      });
    }

    console.log('=== [DEBUG] Skill Map ===');
    // console.log(skillMap);

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
      this.printTree(rootNode);
    }

    console.log('=== [DEBUG] Skill Tree ===');
    // console.log(result);


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

    console.log('=== [DEBUG] Skill Assessment Calculation Complete ===');
    // console.log(skillAssessments);

    return skillMap;
  }

  fetchParents = async (
    ids: number[],
    relatedSkills = new Map<number, SkillFull>(), // << ตัวสะสม
  ): Promise<Map<number, SkillFull>> => {
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
  };

  // ฟังก์ชันคำนวณ Mode
  calculateMode(arr: number[]): number {
    const count = new Map<number, number>();
    arr.forEach((n) => count.set(n, (count.get(n) || 0) + 1));
    const max = Math.max(...count.values());
    const modes = [...count.entries()]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, c]) => c === max)
      .map(([n]) => n);
    return Math.max(...modes);
  }

  // ฟังก์ชัน recursive fill gained level
  fillGained(node: any): number | undefined {
    if (!node.subskills.length) return node.gained;
    const childGained = node.subskills
      .map((child: any) => this.fillGained(child))
      .filter((x: any) => x !== undefined) as number[];

    if (childGained.length > 0) node.gained = this.calculateMode(childGained);
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
