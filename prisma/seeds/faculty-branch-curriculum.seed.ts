import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createFacultiesAndBranches() {
  console.log('🌱 Creating faculties and branches...');
  
  const data = await loadData('faculties-branches.json');

  // ใช้ Transaction เพื่อให้แน่ใจว่าทุกอย่างสำเร็จหรือล้มเหลวพร้อมกัน
  await prisma.$transaction(async (tx) => {
    // สร้างคณะก่อน
    const facultyData = data.map((faculty) => ({
      thaiName: faculty.thaiName,
      engName: faculty.engName,
      thaiDescription: faculty.thaiDescription,
      engDescription: faculty.engDescription,
      abbrev: faculty.abbrev,
    }));
    await tx.faculty.createMany({
      data: facultyData,
      skipDuplicates: true,
    });

    // ดึงข้อมูลคณะที่สร้างเพื่อ map ID
    const createdFaculties = await tx.faculty.findMany({
      select: { id: true, thaiName: true },
    });
    const facultyMap = new Map(createdFaculties.map((f) => [f.thaiName, f.id]));

    // เตรียมข้อมูลสาขา
    const branchData = [];
    for (const faculty of data) {
      const facultyId = facultyMap.get(faculty.thaiName);
      if (!facultyId) {
        console.warn(`Faculty not found: ${faculty.thaiName}`);
        continue;
      }
      for (const branch of faculty.branches) {
        branchData.push({
          thaiName: branch.thaiName,
          engName: branch.engName,
          thaiDescription: branch.thaiDescription,
          engDescription: branch.engDescription,
          abbrev: branch.abbrev,
          facultyId: facultyId,
        });
      }
    }

    // สร้างสาขาทั้งหมด
    if (branchData.length > 0) {
      await tx.branch.createMany({
        data: branchData,
        skipDuplicates: true,
      });
    }
  });

  console.log('✅ Faculties and branches created successfully');
}

export async function createCurricula() {
  console.log('🌱 Creating curricula...');
  
  const data = await loadData('curriculums.json');

  // ดึงข้อมูลสาขาเพื่อ map ID
  const branches = await prisma.branch.findMany({
    select: { id: true, thaiName: true },
  });
  const branchMap = new Map(branches.map((b) => [b.thaiName, b.id]));

  const curriculumData = data.map((curriculum) => {
    const branchId = branchMap.get(curriculum.branchThaiName);
    if (!branchId) {
      console.warn(`Branch not found for curriculum: ${curriculum.branchThaiName}`);
      return null;
    }
    return {
      branchId: branchId,
      code: curriculum.code,
      thaiName: curriculum.thaiName,
      engName: curriculum.engName,
      thaiDegree: curriculum.thaiDegree,
      engDegree: curriculum.engDegree,
      period: curriculum.period,
      minimumGrade: curriculum.minimumGrade,
      thaiDescription: curriculum.thaiDescription,
      engDescription: curriculum.engDescription,
    };
  }).filter(Boolean);

  if (curriculumData.length > 0) {
    await prisma.curriculum.createMany({
      data: curriculumData,
      skipDuplicates: true,
    });
  }

  console.log('✅ Curricula created successfully');
}
