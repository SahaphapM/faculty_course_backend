import { Injectable } from '@nestjs/common';
import { LearningDomain } from 'src/enums/learning-domain.enum';
import { Skill } from 'src/generated/nestjs-dto/skill.entity';
import { Student } from 'src/generated/nestjs-dto/student.entity';
import { PrismaService } from 'src/prisma/prisma.service';

// แนะนำให้พิมพ์ type ให้ชัดแทน any
type SkillLite = { id: number; parent?: { id: number } | null };

// Minimal shape used by syncStudentSkillAssessments, matching Prisma select in service
type SkillCollectionLite = {
  id?: number;
  gainedLevel: number;
  clo?: { skill?: { id: number } | null } | null;
};

type RootSkillLite = {
  id: number;
  parentId: number | null;
};

@Injectable()
export class SkillCollectionsHelper {
  constructor(private prisma: PrismaService) {}

  async syncStudentSkillAssessments(
    student: Partial<Student>,
    rootSkills: RootSkillLite[],
    skillCollections: SkillCollectionLite[],
  ) {
    console.log(
      `=== [DEBUG] Start Skill Assessment Sync for student ${student} ===`,
    );

    if (!student) {
      console.error(`Student ${student} not found`);
      return;
    }

    console.log('=== [DEBUG] Student ===');
    console.log(student)

    console.log('=== [DEBUG] Root Skills ===');
    console.log(rootSkills)

    console.log('=== [DEBUG] Skill Collections ===');
    console.log(skillCollections)

    // เก็บ skillId ทั้งหมดจาก skillCollections
    const skillIds = new Set<number>();
    skillCollections.forEach((sc) => {
      const skillId = sc.clo?.skill?.id;
      if (skillId) skillIds.add(skillId);
    });

    console.log('=== [DEBUG] Skill IDs ===');
    console.log(skillIds)

    const relatedSkills = await this.fetchParents(Array.from(skillIds));

    console.log('=== [DEBUG] Related Skills ===');
    console.log(relatedSkills);

    // เพิ่ม root skills เข้าไป ถ้ายังไม่มี
    rootSkills.forEach((root) => {
      if (!relatedSkills.has(root.id)) {
        relatedSkills.set(root.id, root);
      }
    });

    // สร้าง skillLevelMap (เก็บ gained level ของทุก skill ที่ student มี)
    const skillLevelMap = new Map<number, number>();
    skillCollections.forEach((sc) => {
      const skillId = sc.clo?.skill?.id;
      if (skillId) {
        const current = skillLevelMap.get(skillId) || 0;
        skillLevelMap.set(skillId, Math.max(current, sc.gainedLevel));
      }
    });

    console.log('=== [DEBUG] Skill Level Map ===');
    console.log(skillLevelMap);

    // Build skill tree
    const skillMap = new Map<number, any>();
    relatedSkills.forEach((skill) => {
      skillMap.set(skill.id, {
        id: skill.id,
        parentId: skill.parent?.id || null,
        gained: skillLevelMap.get(skill.id) || 0,
        subskills: [],
      });
    });

    for (const node of skillMap.values()) {
      if (node.parentId) {
        const parent = skillMap.get(node.parentId);
        if (parent) parent.subskills.push(node);
      }
    }

    // คำนวณ root gained level และ debug
    rootSkills.forEach((root) => {
      const rootNode = skillMap.get(root.id);
      if (rootNode) {
        this.fillGained(rootNode);
        this.printTree(rootNode);
      }
    });

    console.log('=== [DEBUG] Skill Tree Calculation Complete ===');
    console.log(skillMap);
   
    const skillAssessments = [];

    // สร้าง/อัปเดต skill_assessment
    for (const rootSkill of rootSkills) {
      const rootNode = skillMap.get(rootSkill.id);
      const curriculumLevel = rootNode?.gained || 0;

      const skillAssessment = await this.prisma.skill_assessment.upsert({
        where: {
          skillId_studentId: { skillId: rootSkill.id, studentId: student.id },
        },
        update: {
          curriculumLevel,
          finalLevel: curriculumLevel,
        },
        create: {
          studentId: student.id,
          skillId: rootSkill.id,
          curriculumLevel,
          companyLevel: 0,
          finalLevel: curriculumLevel,
        },
      });

      skillAssessments.push(skillAssessment);
    }
    
    console.log('=== [DEBUG] Skill Assessment Calculation Complete ===');
    console.log(skillAssessments)

    return skillAssessments;
  }

  fetchParents = async (
    ids: number[],
    relatedSkills = new Map<number, SkillLite>(), // << ตัวสะสม
  ): Promise<Map<number, SkillLite>> => {
    if (!ids.length) return relatedSkills;

    const skills: SkillLite[] = await this.prisma.skill.findMany({
      where: { id: { in: ids } },
      include: { parent: { select: { id: true } } },
    });

    const newParentIds: number[] = [];

    for (const skill of skills) {
      if (!relatedSkills.has(skill.id)) {
        relatedSkills.set(skill.id, skill);
        const pid = skill.parent?.id ?? null;
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
    // console.log(`${indent}- Skill ${node.id} (level ${node.gained || 0})`);
    for (const child of node.subskills) {
      this.printTree(child, indent + '  ');
    }
  }
}
