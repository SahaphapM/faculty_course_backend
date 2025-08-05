import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createInstructors() {
  console.log('🌱 Creating instructors...');
  
  const branch = await prisma.branch.findFirst();
  if (!branch) {
    throw new Error('No branch found. Please run branch seed first.');
  }

  // Load instructor data from fixture
  const instructorFixtureData = await loadData('instructors.json');
  
  const instructorData = instructorFixtureData.map((instructor: any) => ({
    ...instructor,
    branchId: branch.id,
  }));

  await prisma.instructor.createMany({
    data: instructorData,
    skipDuplicates: true,
  });
  
  console.log('✅ Created instructors');
}
