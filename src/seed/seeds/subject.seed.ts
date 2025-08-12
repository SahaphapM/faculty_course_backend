import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'prisma', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createSubjects(prisma: PrismaClient) {
  console.log('🌱 Creating subjects...');
  
  const subjectsData = await loadData('subjects.json');
  
  for (const subjectData of subjectsData) {
    try {
      await prisma.subject.create({
        data: {
          code: subjectData.code,
          thaiName: subjectData.thaiName,
          engName: subjectData.engName,
          credit: subjectData.credit,
          type: subjectData.type,
          thaiDescription: subjectData.thaiDescription,
          engDescription: subjectData.engDescription,
          curriculumId: 1, // Default curriculum ID - ต้องหา curriculum ที่มีอยู่จริง
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Subject "${subjectData.code}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating subject "${subjectData.code}":`, error.message);
      }
    }
  }
  
  console.log('✅ Subjects created successfully');
}
