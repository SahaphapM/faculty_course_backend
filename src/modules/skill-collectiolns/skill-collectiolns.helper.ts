import { Injectable } from '@nestjs/common';
import { Skill } from 'src/generated/nestjs-dto/skill.entity';
import { Student } from 'src/generated/nestjs-dto/student.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SkillCollectionsHelper {
  constructor(private prisma: PrismaService) {}

  async updateSkillAssessments(student: Student, allRootSkills: Skill[]) {
    console.log(
      `=== [DEBUG] Start Skill Assessment for student ${student.id} ===`,
    );

    // 1. ดึง skill collections ของ student
    const skillCollections = await this.getStudentSkillCollections(student.id);

    // 2. เก็บ gainedLevel ของทุก skill
    const skillLevelMap = this.buildSkillLevelMap(skillCollections);

    // 3. ดึง skill ทั้งหมดพร้อม parent chain
    const relatedSkills = await this.getRelatedSkills(skillCollections);

    // 4. สร้าง skill tree
    const rootsFromUpload = this.buildSkillTree(relatedSkills, skillLevelMap);

    // 5. คำนวณ gained level ของ root skill
    rootsFromUpload.forEach((root) => this.fillGained(root));

    // 6. แสดง tree สำหรับ debug
    console.log('\n[DEBUG] Skill Tree Calculation:');
    rootsFromUpload.forEach((root) => this.printTree(root));

    // 7. อัปเดต skill_assessment
    for (const rootSkill of allRootSkills) {
      const matchedRoot = rootsFromUpload.find((r) => r.id === rootSkill.id);
      const curriculumLevel = matchedRoot?.gained || 0;
      await this.upsertSkillAssessment(
        student.id,
        rootSkill.id,
        curriculumLevel,
      );
    }

    console.log('=== [DEBUG] Skill Assessment Complete ===');
  }

  /* -------------------- Helper Functions -------------------- */

  // ดึง skill collections
  private async getStudentSkillCollections(studentId: number) {
    return this.prisma.skill_collection.findMany({
      where: { studentId },
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
                        parent: true,
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
  }

  // สร้าง map สำหรับ skill → gainedLevel
  private buildSkillLevelMap(skillCollections: any[]) {
    const map = new Map<number, number>();
    skillCollections.forEach((sc) => {
      const skill = sc.clo?.skill;
      if (skill) {
        const current = map.get(skill.id) || 0;
        map.set(skill.id, Math.max(current, sc.gainedLevel));
      }
    });
    return map;
  }

  // ดึง skill ทั้งหมด (รวม parent chain)
  private async getRelatedSkills(skillCollections: any[]) {
    const skillIds = new Set<number>();
    skillCollections.forEach((sc) => {
      let skill = sc.clo?.skill;
      while (skill) {
        skillIds.add(skill.id);
        skill = skill.parent;
      }
    });
    return this.prisma.skill.findMany({
      where: { id: { in: Array.from(skillIds) } },
      include: { parent: true },
    });
  }

  // สร้าง skill tree
  private buildSkillTree(
    relatedSkills: any[],
    skillLevelMap: Map<number, number>,
  ) {
    const skillMap = new Map<number, any>();

    relatedSkills.forEach((s) => {
      skillMap.set(s.id, {
        id: s.id,
        parentId: s.parent?.id || null,
        gained: skillLevelMap.get(s.id) || 0,
        subskills: [],
      });
    });

    for (const node of skillMap.values()) {
      if (node.parentId) {
        const parent = skillMap.get(node.parentId);
        if (parent) parent.subskills.push(node);
      }
    }

    return [...skillMap.values()].filter((n) => n.parentId === null);
  }

  // คำนวณ gainedLevel แบบ recursive โดยใช้ mode ของลูก
  private fillGained(node: any): number | undefined {
    if (!node.subskills.length) return node.gained;
    const childGained = node.subskills
      .map((c) => this.fillGained(c))
      .filter(Boolean) as number[];
    if (childGained.length) node.gained = this.calculateMode(childGained);
    return node.gained;
  }

  private calculateMode(numbers: number[]): number {
    const count = new Map<number, number>();
    numbers.forEach((n) => count.set(n, (count.get(n) || 0) + 1));
    const maxCount = Math.max(...count.values());
    const modes = [...count.entries()]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, c]) => c === maxCount)
      .map(([n]) => n);
    return Math.max(...modes);
  }

  // แสดงผล tree แบบดูง่าย
  private printTree(node: any, indent = '') {
    console.log(`${indent}- Skill ${node.id} (level ${node.gained})`);
    node.subskills.forEach((child) => this.printTree(child, indent + '  '));
  }

  // อัปเดต skill_assessment
  private async upsertSkillAssessment(
    studentId: number,
    skillId: number,
    curriculumLevel: number,
  ) {
    await this.prisma.skill_assessment.upsert({
      where: { skillId_studentId: { skillId, studentId } },
      update: { curriculumLevel, finalLevel: curriculumLevel },
      create: {
        studentId,
        skillId,
        curriculumLevel,
        companyLevel: 0,
        finalLevel: curriculumLevel,
      },
    });
  }
}
