import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createSkillAssessments() {
  console.log('🌱 Creating skill assessments...');
  
  const data = await loadData('skill_assessments.json');

  // Get all students and skills for mapping
  const students = await prisma.student.findMany({
    select: { id: true, code: true },
  });
  const skills = await prisma.skill.findMany({
    select: { id: true, thaiName: true },
  });

  const studentMap = new Map(students.map((s) => [s.code, s.id]));
  const skillMap = new Map(skills.map((s) => [s.thaiName, s.id]));

  const assessmentData = data.map((assessment) => {
    const studentId = studentMap.get(assessment.studentCode);
    const skillId = skillMap.get(assessment.skillThaiName);
    
    if (!studentId) {
      console.warn(`Student not found: ${assessment.studentCode}`);
      return null;
    }
    if (!skillId) {
      console.warn(`Skill not found: ${assessment.skillThaiName}`);
      return null;
    }
    
    return {
      studentId: studentId,
      skillId: skillId,
      curriculumLevel: assessment.curriculumLevel,
      companyLevel: assessment.companyLevel,
      finalLevel: assessment.finalLevel,
      curriculumComment: assessment.curriculumComment,
      companyComment: assessment.companyComment,
    };
  }).filter(Boolean);

  if (assessmentData.length > 0) {
    await prisma.skill_assessment.createMany({
      data: assessmentData,
      skipDuplicates: true,
    });
  }

  console.log(`✅ Created ${assessmentData.length} skill assessment records`);
}
