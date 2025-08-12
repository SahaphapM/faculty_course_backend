import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'prisma', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createCLOs(prisma: PrismaClient) {
  console.log('🌱 Creating CLOs...');
  
  // สร้าง CLOs จาก subjects และ skills ที่มีอยู่
  const subjects = await prisma.subject.findMany();
  const skills = await prisma.skill.findMany();
  
  for (const subject of subjects) {
    try {
      // สร้าง CLO 1: Knowledge
      await prisma.clo.create({
        data: {
          name: `${subject.code}-CLO1`,
          thaiDescription: `มีความรู้และความเข้าใจใน${subject.thaiName}`,
          engDescription: `Have knowledge and understanding of ${subject.engName}`,
          subjectId: subject.id,
          expectSkillLevel: 3,
        },
      });
      
      // สร้าง CLO 2: Skills
      await prisma.clo.create({
        data: {
          name: `${subject.code}-CLO2`,
          thaiDescription: `สามารถประยุกต์ใช้ความรู้ใน${subject.thaiName}`,
          engDescription: `Can apply knowledge in ${subject.engName}`,
          subjectId: subject.id,
          expectSkillLevel: 4,
        },
      });
      
      // สร้าง CLO 3: Attitudes
      await prisma.clo.create({
        data: {
          name: `${subject.code}-CLO3`,
          thaiDescription: `มีเจตคติที่ดีต่อการเรียนรู้${subject.thaiName}`,
          engDescription: `Have good attitude towards learning ${subject.engName}`,
          subjectId: subject.id,
          expectSkillLevel: 2,
        },
      });
    } catch (error) {
      console.error(`❌ Error creating CLOs for subject "${subject.code}":`, error.message);
    }
  }
  
  console.log('✅ CLOs created successfully');
}
