import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'prisma', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createFacultiesAndBranches(prisma: PrismaClient) {
  console.log('🌱 Creating faculties and branches...');
  
  const facultiesData = await loadData('faculties-branches.json');
  
  for (const facultyData of facultiesData) {
    try {
      const faculty = await prisma.faculty.create({
        data: { 
          thaiName: facultyData.thaiName,
          engName: facultyData.engName,
        },
      });
      
      for (const branchData of facultyData.branches) {
        try {
          await prisma.branch.create({
            data: { 
              thaiName: branchData.thaiName,
              engName: branchData.engName,
              facultyId: faculty.id 
            },
          });
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`⚠️  Branch "${branchData.thaiName}" already exists, skipping...`);
          } else {
            console.error(`❌ Error creating branch "${branchData.thaiName}":`, error.message);
          }
        }
      }
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Faculty "${facultyData.thaiName}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating faculty "${facultyData.thaiName}":`, error.message);
      }
    }
  }
  
  console.log('✅ Faculties and branches created successfully');
}

export async function createCurricula(prisma: PrismaClient) {
  console.log('🌱 Creating curricula...');
  
  const curriculumsData = await loadData('curriculums.json');
  
  for (const curriculumData of curriculumsData) {
    try {
      const branch = await prisma.branch.findFirst({
        where: { thaiName: curriculumData.branchThaiName }
      });
      
      if (branch) {
        await prisma.curriculum.create({
          data: {
            thaiName: curriculumData.thaiName,
            engName: curriculumData.engName,
            thaiDegree: curriculumData.thaiDegree,
            engDegree: curriculumData.engDegree,
            thaiDescription: curriculumData.thaiDescription,
            engDescription: curriculumData.engDescription,
            branchId: branch.id,
            code: curriculumData.code,
            period: curriculumData.period,
            minimumGrade: curriculumData.minimumGrade,
          },
        });
      } else {
        console.warn(`⚠️  Branch "${curriculumData.branchThaiName}" not found for curriculum "${curriculumData.thaiName}"`);
      }
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Curriculum "${curriculumData.code}" already exists, skipping...`);
      } else {
        console.error(`❌ Error creating curriculum "${curriculumData.code}":`, error.message);
      }
    }
  }
  
  console.log('✅ Curricula created successfully');
}
