import { Injectable } from '@nestjs/common';
import { Student } from 'src/generated/nestjs-dto/student.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkillCollectionsHelper {
  constructor(private prisma: PrismaService) {}

  async updateSkillAssessments(student: Student) {
    // 1. ดึง skill collections ของ student
    const skillCollections = await this.prisma.skill_collection.findMany({
      where: { studentId: student.id },
      select: {
        gainedLevel: true,
        clo: {
          select: {
            skill: {
              select: {
                id: true,
                parent: {
                  select: {
                    id: true,
                    parent: {
                      select: {
                        id: true,
                        parent: true, // ไล่ได้หลายชั้น
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. สร้าง skill tree + คำนวณ root skill gained level
    const skillLevelMap = new Map<number, number>();
    skillCollections.forEach((sc) => {
      const skill = sc.clo?.skill;
      if (!skill) return;
      const current = skillLevelMap.get(skill.id) || 0;
      skillLevelMap.set(skill.id, Math.max(current, sc.gainedLevel));
    });

    // ดึง skill ทั้งหมดจาก parent chain
    const skillIds = new Set<number>();

    skillCollections.forEach((sc) => {
      let skill = sc.clo?.skill as { id: number; parent?: any | null } | null;
      while (skill) {
        skillIds.add(skill.id);
        skill = skill.parent;
      }
    });

    const relatedSkills = await this.prisma.skill.findMany({
      where: { id: { in: Array.from(skillIds) } },
      include: { parent: true },
    });

    // Build tree
    const skillMap = new Map<number, any>();
    relatedSkills.forEach((s) =>
      skillMap.set(s.id, {
        id: s.id,
        parentId: s.parent?.id || null,
        gained: skillLevelMap.get(s.id),
        subskills: [],
      }),
    );

    for (const node of skillMap.values()) {
      if (node.parentId) {
        const parent = skillMap.get(node.parentId);
        if (parent) parent.subskills.push(node);
      }
    }

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

    function fillGained(node: any): number | undefined {
      if (!node.subskills.length) return node.gained;
      const childGained = node.subskills
        .map(fillGained)
        .filter((x) => x !== undefined) as number[];
      if (childGained.length > 0) node.gained = calculateMode(childGained);
      return node.gained;
    }

    const rootsFromUpload = [...skillMap.values()].filter(
      (n) => n.parentId === null,
    );
    rootsFromUpload.forEach(fillGained);

    const allRootSkills = await this.prisma.skill.findMany({
      where: { parent: null, curriculumId: student.curriculumId },
    });

    // 6. อัปเดตหรือสร้าง skill_assessment สำหรับ root skill ทุกตัว
    for (const rootSkill of allRootSkills) {
      const existingRoot = rootsFromUpload.find((r) => r.id === rootSkill.id);
      const curriculumLevel = existingRoot?.gained || 0;

      await this.prisma.skill_assessment.upsert({
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
    }
  }
}
