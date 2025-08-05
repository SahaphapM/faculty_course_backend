import { PrismaClient } from '@prisma/client';
import * as bcrypt from '@node-rs/bcrypt';
import * as path from 'path';
import * as fs from 'fs/promises';
import { UserRole } from 'src/enums/role.enum';
const prisma = new PrismaClient();

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

async function createFacultiesAndBranches() {
  const data = await loadData('fixture/faculties-branches.json');

  // ใช้ Transaction เพื่อให้แน่ใจว่าทุกอย่างสำเร็จหรือล้มเหลวพร้อมกัน
  await prisma.$transaction(async (tx) => {
    // สร้างคณะก่อน
    const facultyData = data.map((faculty) => ({
      thaiName: faculty.thaiName,
      engName: faculty.engName,
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
          facultyId: facultyId,
        });
      }
    }

    // สร้างสาขา
    if (branchData.length > 0) {
      await tx.branch.createMany({
        data: branchData,
        skipDuplicates: true,
      });
    }
  });

  console.log('Faculties and branches created successfully');
}

async function createCurricula() {
  const data = await loadData('fixture/curriculums.json');

  await prisma.$transaction(async (tx) => {
    // ดึงข้อมูลสาขาทั้งหมดเพื่อ map กับ branchThaiName
    const branches = await tx.branch.findMany({
      select: { id: true, thaiName: true },
    });
    const branchMap = new Map(branches.map((b) => [b.thaiName, b.id]));

    // เตรียมข้อมูลหลักสูตร
    const curriculaData = data.map((curriculum) => {
      const branchId = branchMap.get(curriculum.branchThaiName);
      if (!branchId) {
        console.warn(`Branch not found for curriculum: ${curriculum.thaiName}`);
        throw new Error(`Branch "${curriculum.branchThaiName}" not found`);
      }

      return {
        code: curriculum.code,
        thaiName: curriculum.thaiName,
        engName: curriculum.engName,
        thaiDegree: curriculum.thaiDegree,
        engDegree: curriculum.engDegree,
        period: curriculum.period,
        minimumGrade: curriculum.minimumGrade,
        thaiDescription: curriculum.thaiDescription,
        engDescription: curriculum.engDescription,
        branchId: branchId,
      };
    });

    // เพิ่มหลักสูตรลงในฐานข้อมูล
    await tx.curriculum.createMany({
      data: curriculaData,
      skipDuplicates: true,
    });

    console.log('Curricula created successfully');
  });
}

async function createUsers() {
  const saltRounds = 10;
  // Seed data
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@buu.dev',
        password: await bcrypt.hash('pass2025', saltRounds),
        role: UserRole.Admin,
      },
      {
        email: 'coo@buu.dev',
        password: await bcrypt.hash('pass2025', saltRounds),
        role: UserRole.Coordinator,
      },
      {
        email: 'ins@buu.dev',
        password: await bcrypt.hash('pass2025', saltRounds),
        role: UserRole.Instructor,
      },
      {
        email: 'stu@buu.dev',
        password: await bcrypt.hash('pass2025', saltRounds),
        role: UserRole.Student,
      },
    ],
    skipDuplicates: true, // Optional: skips if email already exists
  });
}

async function main() {
  await createUsers();
  await createFacultiesAndBranches();
  await createCurricula();
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
