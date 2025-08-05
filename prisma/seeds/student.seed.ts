import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createStudents() {
  console.log('🌱 Creating students...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run curriculum seed first.');
  }

  const branch = await prisma.branch.findFirst({ 
    where: { id: curriculum.branchId } 
  });
  if (!branch) {
    throw new Error('No branch found for curriculum');
  }

  // Load students data from fixture
  const studentsData = await loadData('student.json');

  // Create students
  const studentsToCreate = studentsData.map((student: any) => ({
    code: student.code,
    thaiName: student.thaiName,
    engName: student.engName,
    enrollmentDate: new Date(student.enrollmentDate),
    curriculumId: curriculum.id,
    branchId: branch.id,
  }));

  const createdStudents = [];
  for (const studentData of studentsToCreate) {
    const student = await prisma.student.upsert({
      where: { code: studentData.code },
      update: studentData,
      create: studentData,
    });
    createdStudents.push(student);
  }
  
  console.log(`✅ Created ${createdStudents.length} students`);
  return createdStudents;
}

export async function createSkillCollections() {
  console.log('🌱 Creating skill collections...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found.');
  }

  // Get all created skills and students
  const allSkills = await prisma.skill.findMany({ 
    where: { curriculumId: curriculum.id } 
  });
  const allStudents = await prisma.student.findMany({
    where: { curriculumId: curriculum.id }
  });

  if (allSkills.length === 0 || allStudents.length === 0) {
    console.warn('No skills or students found. Skipping skill collections.');
    return;
  }

  // Create skill collections (link all skills to each student)
  const skillCollections = [];
  for (const student of allStudents) {
    for (const skill of allSkills) {
      // Generate random skill levels (1-5) with realistic distribution
      const random = Math.random();
      let gainedLevel;
      
      // 60% chance for level 3-4 (competent)
      if (random < 0.6) {
        gainedLevel = Math.floor(Math.random() * 2) + 3; // 3-4
      }
      // 25% chance for level 2-3 (developing)
      else if (random < 0.85) {
        gainedLevel = Math.floor(Math.random() * 2) + 2; // 2-3
      }
      // 15% chance for level 4-5 (advanced)
      else {
        gainedLevel = Math.floor(Math.random() * 2) + 4; // 4-5
      }

      skillCollections.push({
        studentId: student.id,
        gainedLevel,
        passed: gainedLevel >= 3,
        cloId: null,
        courseId: null,
      });
    }
  }

  await prisma.skill_collection.createMany({
    data: skillCollections,
  });
  
  console.log(`✅ Created ${skillCollections.length} skill collection records`);
}
