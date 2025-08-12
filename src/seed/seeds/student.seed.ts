import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'prisma', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createStudents(prisma: PrismaClient) {
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
    try {
      const student = await prisma.student.create({
        data: studentData,
      });
      createdStudents.push(student);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Student "${studentData.code}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating student "${studentData.code}":`, error.message);
      }
    }
  }
  
  console.log(`✅ Created ${createdStudents.length} students`);
  return createdStudents;
}
