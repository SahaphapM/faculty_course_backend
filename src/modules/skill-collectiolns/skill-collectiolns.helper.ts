import { Injectable } from '@nestjs/common';
import { Skill } from 'src/generated/nestjs-dto/skill.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkillCollectionsHelper {
  constructor(private prisma: PrismaService) {}

  async updateSkillAssessments(studentId: number, rootSkills: Skill[]) {
    console.log(
      `=== [DEBUG] Start Skill Assessment for student ${studentId} ===`,
    );

    // 1️⃣ ดึงข้อมูล Student
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
      },
    });

    if (!student) {
      console.error(`Student ${studentId} not found`);
      return;
    }

    // 2️⃣ ดึง skill collections ของ student
    const skillCollections = await this.prisma.skill_collection.findMany({
      where: { studentId },
      select: {
        gainedLevel: true,
        clo: { select: { skill: { select: { id: true } } } },
      },
    });

    // 4️⃣ เก็บ skillId ทั้งหมดจาก skillCollections
    const skillIds = new Set<number>();
    skillCollections.forEach((sc) => {
      const skillId = sc.clo?.skill?.id;
      if (skillId) skillIds.add(skillId);
    });

    // 5️⃣ ดึง skill พร้อม parent chain (recursive)
    const relatedSkills = new Map<number, any>();

    const fetchParents = async (ids: number[]) => {
      const skills = await this.prisma.skill.findMany({
        where: { id: { in: ids } },
        include: { parent: true },
      });

      const newParentIds: number[] = [];

      for (const skill of skills) {
        if (!relatedSkills.has(skill.id)) {
          relatedSkills.set(skill.id, skill);

          if (skill.parent && !relatedSkills.has(skill.parent.id)) {
            newParentIds.push(skill.parent.id);
          }
        }
      }

      if (newParentIds.length > 0) {
        await fetchParents(newParentIds); // 🔄 ไล่ parent ต่อจนสุด
      }
    };

    await fetchParents(Array.from(skillIds));

    // 6️⃣ เพิ่ม root skills เข้าไป ถ้ายังไม่มี
    rootSkills.forEach((root) => {
      if (!relatedSkills.has(root.id)) {
        relatedSkills.set(root.id, root);
      }
    });

    // 7️⃣ สร้าง skillLevelMap (เก็บ gained level ของทุก skill ที่ student มี)
    const skillLevelMap = new Map<number, number>();
    skillCollections.forEach((sc) => {
      const skillId = sc.clo?.skill?.id;
      if (skillId) {
        const current = skillLevelMap.get(skillId) || 0;
        skillLevelMap.set(skillId, Math.max(current, sc.gainedLevel));
      }
    });

    // 8️⃣ Build skill tree
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

    // 9️⃣ ฟังก์ชันคำนวณ Mode
    function calculateMode(arr: number[]): number {
      const count = new Map<number, number>();
      arr.forEach((n) => count.set(n, (count.get(n) || 0) + 1));
      const max = Math.max(...count.values());
      const modes = [...count.entries()]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, c]) => c === max)
        .map(([n]) => n);
      return Math.max(...modes);
    }

    // 🔟 ฟังก์ชัน recursive fill gained level
    function fillGained(node: any): number | undefined {
      if (!node.subskills.length) return node.gained;
      const childGained = node.subskills
        .map(fillGained)
        .filter((x) => x !== undefined) as number[];
      if (childGained.length > 0) node.gained = calculateMode(childGained);
      return node.gained;
    }

    // 11️⃣ Debug Tree
    function printTree(node: any, indent = '') {
      console.log(`${indent}- Skill ${node.id} (level ${node.gained || 0})`);
      for (const child of node.subskills) {
        printTree(child, indent + '  ');
      }
    }

    // 12️⃣ คำนวณ root gained level และ debug
    console.log('\n[DEBUG] Skill Tree Calculation:');
    rootSkills.forEach((root) => {
      const rootNode = skillMap.get(root.id);
      if (rootNode) {
        fillGained(rootNode);
        printTree(rootNode);
      }
    });

    // 13️⃣ อัปเดต skill_assessment
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
  }
}
