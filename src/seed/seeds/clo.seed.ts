import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

async function loadData(fileName: string) {
  const filePath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    'prisma',
    'fixture',
    fileName,
  );
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

const randomNumber = (levels: number[]) => {
  return levels[Math.floor(Math.random() * levels.length)];
};

export async function createCLOs(prisma: PrismaClient) {
  console.log('🌱 Creating CLOs...');

  // สร้าง CLOs จาก subjects และ skills ที่มีอยู่
  const subjects = await prisma.subject.findMany();
  // หา skill ที่ไม่มี sub skill
  const skills = await prisma.skill.findMany({
    where: {
      subs: {
        none: {},
      },
    },
    take: 20
  });
  let num = 0;

  

  try {
    const subject = subjects[0];
    // สร้าง CLO 1: Knowledge
    // forloop skill
    for (const skill of skills) {
      await prisma.clo.create({
        data: {
          name: `${subject.code}-CLO${num + 1}`,
          thaiDescription: `มีความรู้และความเข้าใจใน${subject.thaiName}`,
          engDescription: `Have knowledge and understanding of ${subject.engName}`,
          subjectId: subject.id,
          expectSkillLevel: randomNumber([1, 2, 3, 4, 5]),
          skillId: skill.id,
        },
      });
      num++;
    }
  } catch (error) {
    console.error(
      `❌ Error creating CLOs for subject "${subjects[0].code}":`,
      error.message,
    );
  }
  console.log('✅ CLOs created successfully');
}
