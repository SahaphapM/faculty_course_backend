import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createPLOs() {
  console.log('🌱 Creating PLOs...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run curriculum seed first.');
  }

  // Load PLO data from fixture
  const ploFixtureData = await loadData('plos.json');
  
  const ploData = ploFixtureData.map((plo: any) => ({
    ...plo,
    curriculumId: curriculum.id,
  }));

  await prisma.plo.createMany({
    data: ploData,
    skipDuplicates: true,
  });
  
  console.log('✅ Created PLOs');
}
