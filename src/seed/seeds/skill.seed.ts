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
  
  for (const skill of skillsData) {
    await createSKilltree(skill, prisma);
  }

  console.log('✅ Skills created successfully');
}


async function createSKilltree(skill : any, prisma: PrismaClient, parentSkillId?: number){
  try {
  const skillSaved = await prisma.skill.create({
    data: {
      thaiName: skill.thaiName,
      engName: skill.engName,
      thaiDescription: skill.thaiDescription,
      engDescription: skill.engDescription,
      domain: skill.domain,
      curriculumId: 1, // Default curriculum ID - ต้องหา curriculum ที่มีอยู่จริง
      parentId: parentSkillId
    },
  });
  if(skill.subs){
    for (const sub of skill.subs) {
      await createSKilltree(sub, prisma, skillSaved.id);
    }
  }  } catch (error) {
    if (error.code === 'P2002') {
      console.log(`⚠️  Skill "${skill.thaiName}" already exists, skipping...`);
    } else {
      console.error(`❌ Error creating skill "${skill.thaiName}":`, error.message);
    }
  }
}