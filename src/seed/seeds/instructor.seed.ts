import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'prisma', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createInstructors(prisma: PrismaClient) {
  console.log('🌱 Creating instructors...');
  
  const instructorsData = await loadData('instructors.json');
  
  for (const instructorData of instructorsData) {
    try {
      await prisma.instructor.create({
        data: {
          code: instructorData.code,
          email: instructorData.email,
          thaiName: instructorData.thaiName,
          engName: instructorData.engName,
          tel: instructorData.tel,
          position: instructorData.position,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Instructor "${instructorData.email}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating instructor "${instructorData.email}":`, error.message);
      }
    }
  }
  
  console.log('✅ Instructors created successfully');
}
