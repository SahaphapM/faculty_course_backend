import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createSkills() {
  console.log('🌱 Creating skills...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run faculty/branch/curriculum seed first.');
  }

  // Load skills data from fixture
  const skillsData = await loadData('skills.json');
  
  // Create skills with curriculum reference
  const skillsToCreate = skillsData.map((skill: any) => ({
    ...skill,
    curriculumId: curriculum.id,
  }));

  await prisma.skill.createMany({
    data: skillsToCreate,
    skipDuplicates: true,
  });
  
  console.log(`✅ Created ${skillsToCreate.length} skills`);
}
