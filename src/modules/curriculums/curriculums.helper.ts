// Helper functions for curriculums

import { LearningDomain } from 'src/enums/learning-domain.enum';

import { PrismaService } from 'src/prisma/prisma.service';

const prisma = new PrismaService();

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

export function generateSkillSummary(skills: any[]) {
  const rootSkills = skills.filter((skill) => skill.parentId === null);

  return rootSkills.map((rootSkill) => {
    const leafSkills = findAllLeafSkills(rootSkill.id, skills);
    const studentCategories = categorizeStudents(leafSkills);
    const { levelSummary, totalStudents } =
      calculateLevelSummary(studentCategories);

    // Create default level summary with zero counts
    const defaultLevels = [
      { category: 'above', count: 0, studentIds: [] },
      { category: 'on', count: 0, studentIds: [] },
      { category: 'below', count: 0, studentIds: [] },
    ];

    // Merge with actual data if exists
    const mergedLevels = defaultLevels.map((defaultLevel) => {
      const existingLevel = levelSummary.find(
        (l) => l.category === defaultLevel.category,
      );
      return existingLevel || defaultLevel;
    });

    return {
      skillName: rootSkill.thaiName,
      skillId: rootSkill.id,
      domain: rootSkill.domain,
      totalStudent: totalStudents,
      levelSummary: mergedLevels,
    };
  });
}

export function findAllLeafSkills(rootId: number, skills: any[]): any[] {
  const findDescendants = (id: number): any[] => {
    const children = skills.filter((s) => s.parentId === id);
    return children.length === 0
      ? [skills.find((s) => s.id === id)]
      : children.flatMap((child) => findDescendants(child.id));
  };

  return findDescendants(rootId);
}

export function categorizeStudents(
  leafSkills: any[],
): Map<number, 'above' | 'on' | 'below'> {
  const studentCategories = new Map<number, 'above' | 'on' | 'below'>();

  leafSkills.forEach((leaf) => {
    leaf.clos.forEach((clo) => {
      if (clo.expectSkillLevel == null) return;

      clo.skill_collections.forEach((collection) => {
        const { studentId, gainedLevel } = collection;
        if (gainedLevel == null || studentId == null) return;

        const category = determineCategory(gainedLevel, clo.expectSkillLevel);
        updateStudentCategory(studentCategories, studentId, category);
      });
    });
  });

  return studentCategories;
}

export function determineCategory(
  actualLevel: number,
  expectedLevel: number,
): 'above' | 'on' | 'below' {
  if (actualLevel > expectedLevel) return 'above';
  if (actualLevel === expectedLevel) return 'on';
  return 'below';
}

export function updateStudentCategory(
  categories: Map<number, 'above' | 'on' | 'below'>,
  studentId: number,
  newCategory: 'above' | 'on' | 'below',
): void {
  const currentCategory = categories.get(studentId);

  // Priority: below > on > above
  if (
    !currentCategory ||
    newCategory === 'below' ||
    (currentCategory === 'on' && newCategory === 'above')
  ) {
    categories.set(studentId, newCategory);
  }
}

export function calculateLevelSummary(
  studentCategories: Map<number, 'above' | 'on' | 'below'>,
): { levelSummary: any[]; totalStudents: number } {
  const categoryCounts = { above: 0, on: 0, below: 0 };
  const categorizedStudents = { above: [], on: [], below: [] };

  // Count students in each category
  Array.from(studentCategories.entries()).forEach(([studentId, category]) => {
    categoryCounts[category]++;
    categorizedStudents[category].push(studentId);
  });

  const levelSummary = ['above', 'on', 'below']
    .filter((category) => categoryCounts[category] > 0)
    .map((category) => ({
      category,
      count: categoryCounts[category],
      studentIds: categorizedStudents[category],
    }));

  return {
    levelSummary,
    totalStudents: studentCategories.size,
  };
}
