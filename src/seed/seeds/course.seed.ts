import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, '..', '..', '..', '..', 'prisma', 'fixture', fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createCourses(prisma: PrismaClient) {
  console.log('🌱 Creating courses...');
  
  // สร้าง courses จาก subjects ที่มีอยู่
  const subjects = await prisma.subject.findMany();
  
  for (const subject of subjects) {
    try {
      // สร้าง course สำหรับปี 2025 ภาค 1
      await prisma.course.create({
        data: {
          subjectId: subject.id,
          semester: 1,
          year: 2025,
        },
      });
      
      // สร้าง course สำหรับปี 2025 ภาค 2
      await prisma.course.create({
        data: {
          subjectId: subject.id,
          semester: 2,
          year: 2025,
        },
      });
    } catch (error) {
      console.error(`❌ Error creating course for subject "${subject.code}":`, error.message);
    }
  }
  
  console.log('✅ Courses created successfully');
}

export async function createCourseInstructors(prisma: PrismaClient) {
  console.log('🌱 Creating course instructors...');
  
  const courses = await prisma.course.findMany();
  const instructors = await prisma.instructor.findMany();
  
  for (const course of courses) {
    try {
      // Assign random instructor to each course
      const randomInstructor = instructors[Math.floor(Math.random() * instructors.length)];
      
      if (randomInstructor) {
        await prisma.course_instructor.create({
          data: {
            instructorId: randomInstructor.id,
            courseId: course.id,
          },
        });
      }
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Course instructor relationship already exists, skipping...`);
      } else {
        console.error(`❌ Error creating course instructor:`, error.message);
      }
    }
  }
  
  console.log('✅ Course instructors created successfully');
}
