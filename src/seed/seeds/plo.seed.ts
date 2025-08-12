import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'prisma', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createPLOs(prisma: PrismaClient) {
  console.log('🌱 Creating PLOs...');
  
  const plosData = await loadData('plos.json');
  
  for (const ploData of plosData) {
    try {
      await prisma.plo.create({
        data: {
          name: ploData.name,
          thaiDescription: ploData.thaiDescription,
          engDescription: ploData.engDescription,
          type: ploData.type,
          curriculumId: 1, // Default curriculum ID - ต้องหา curriculum ที่มีอยู่จริง
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  PLO "${ploData.name}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating PLO "${ploData.name}":`, error.message);
      }
    }
  }
  
  console.log('✅ PLOs created successfully');
}
