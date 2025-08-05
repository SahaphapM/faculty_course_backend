import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createSubjects() {
  console.log('🌱 Creating subjects...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run curriculum seed first.');
  }

  // Load subject data from fixture
  const subjectFixtureData = await loadData('subjects.json');
  
  const subjectData = subjectFixtureData.map((subject: any) => ({
    ...subject,
    curriculumId: curriculum.id,
  }));

  await prisma.subject.createMany({
    data: subjectData,
    skipDuplicates: true,
  });
  
  console.log('✅ Created subjects');
}
