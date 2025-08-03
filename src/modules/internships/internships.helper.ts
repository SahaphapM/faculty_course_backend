import { StudentInternship } from 'src/generated/nestjs-dto/studentInternship.entity';
import { Skill } from 'src/generated/nestjs-dto/skill.entity';
import { PrismaClient } from '@prisma/client';

export async function getSkillsByStudent(
  studentId: number,
  prisma: PrismaClient,
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { curriculumId: true },
  });

  if (!student?.curriculumId) {
    throw new Error('Student not found or curriculum not found ' + studentId);
  }

  const skills = await prisma.skill.findMany({
    where: {
      curriculumId: student.curriculumId,
      subs: { none: {} },
    },
    select: { id: true },
  });

  if (!skills || skills.length === 0) {
    throw new Error(
      'Skills not found or empty for curriculum ' + student.curriculumId,
    );
  }

  return skills;
}

export async function createSkillAssessments(
  studentInternships: StudentInternship[],
  skills: Partial<Skill>[],
  prisma: PrismaClient,
) {
  for (const skill of skills) {
    await prisma.skill_assessment.createMany({
      data: studentInternships.map((si) => ({
        studentInternshipId: si.id,
        skillId: skill.id,
        gainedLevel: 0,
      })),
      skipDuplicates: true,
    });
  }
}
