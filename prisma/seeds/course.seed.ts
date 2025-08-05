import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCourses() {
  console.log('🌱 Creating courses...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run curriculum seed first.');
  }

  // Get created subjects
  const createdSubjects = await prisma.subject.findMany({
    where: { curriculumId: curriculum.id },
  });

  if (createdSubjects.length === 0) {
    throw new Error('No subjects found. Please create subjects first.');
  }

  // Create courses for each subject
  const courseData = createdSubjects.slice(0, 6).map((subject, index) => ({
    subjectId: subject.id,
    active: true,
    semester: (index % 2) + 1,
    year: 2024 + Math.floor(index / 2),
  }));

  await prisma.course.createMany({
    data: courseData,
  });
  
  console.log('✅ Created courses');
}

export async function createCourseInstructors() {
  console.log('🌱 Creating course instructors...');
  
  // Get created courses and instructors
  const allCourses = await prisma.course.findMany();
  const createdInstructors = await prisma.instructor.findMany();

  if (createdInstructors.length === 0 || allCourses.length === 0) {
    console.warn('No instructors or courses found. Skipping course instructors.');
    return;
  }

  const courseInstructors = allCourses.map((course, index) => ({
    instructorId: createdInstructors[index % createdInstructors.length].id,
    courseId: course.id,
  }));

  await prisma.course_instructor.createMany({
    data: courseInstructors,
    skipDuplicates: true,
  });
  
  console.log('✅ Created course instructors');
}
