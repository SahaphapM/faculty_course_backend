import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'prisma', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createSkills(prisma: PrismaClient) {
  console.log('🌱 Creating skills...');
  
  const skillsData = await loadData('skills.json');
  
  for (const skillData of skillsData) {
    try {
      await prisma.skill.create({
        data: {
          thaiName: skillData.thaiName,
          engName: skillData.engName,
          thaiDescription: skillData.thaiDescription,
          engDescription: skillData.engDescription,
          domain: skillData.domain,
          curriculumId: 1, // Default curriculum ID - ต้องหา curriculum ที่มีอยู่จริง
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Skill "${skillData.thaiName}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating skill "${skillData.thaiName}":`, error.message);
      }
    }
  }
  
  console.log('✅ Skills created successfully');
}
