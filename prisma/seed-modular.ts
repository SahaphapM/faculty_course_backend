import { PrismaClient } from '@prisma/client';

// Import all seed functions
import { createUsers } from './seeds/user.seed';
import { createFacultiesAndBranches, createCurricula } from './seeds/faculty-branch-curriculum.seed';
import { createSkills } from './seeds/skill.seed';
import { createStudents, createSkillCollections } from './seeds/student.seed';
import { createPLOs } from './seeds/plo.seed';
import { createSubjects } from './seeds/subject.seed';
import { createInstructors } from './seeds/instructor.seed';
import { createCourses, createCourseInstructors } from './seeds/course.seed';
import { createCLOs } from './seeds/clo.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting complete database seeding...');
  
  try {
    // 1. Foundation: Users, Organization Structure
    console.log('\n📋 Phase 1: Foundation Setup');
    await createUsers();
    await createFacultiesAndBranches();
    await createCurricula();
    
    // 2. Academic Core: Skills, Students, Learning Outcomes
    console.log('\n🎓 Phase 2: Academic Core');
    await createSkills();
    await createStudents();
    await createPLOs();
    await createSubjects();
    
    // 3. Teaching Resources: Instructors, Courses
    console.log('\n👨‍🏫 Phase 3: Teaching Resources');
    await createInstructors();
    await createCourses();
    await createCourseInstructors();
    
    // 4. Assessment Framework: CLOs, Skill Collections
    console.log('\n📊 Phase 4: Assessment Framework');
    await createCLOs();
    await createSkillCollections();
    
    console.log('\n🎉 Complete database seeding finished successfully!');
    console.log('📊 Summary:');
    
    // Generate summary statistics
    const stats = await generateSeedingSummary();
    console.log(stats);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function generateSeedingSummary() {
  const [
    userCount,
    facultyCount,
    branchCount,
    curriculumCount,
    skillCount,
    studentCount,
    ploCount,
    subjectCount,
    instructorCount,
    courseCount,
    cloCount,
    skillCollectionCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.faculty.count(),
    prisma.branch.count(),
    prisma.curriculum.count(),
    prisma.skill.count(),
    prisma.student.count(),
    prisma.plo.count(),
    prisma.subject.count(),
    prisma.instructor.count(),
    prisma.course.count(),
    prisma.clo.count(),
    prisma.skill_collection.count()
  ]);

  return `
   👥 Users: ${userCount}
   🏛️  Faculties: ${facultyCount}
   🏢 Branches: ${branchCount}
   📚 Curricula: ${curriculumCount}
   🎯 Skills: ${skillCount}
   👨‍🎓 Students: ${studentCount}
   📋 PLOs: ${ploCount}
   📖 Subjects: ${subjectCount}
   👨‍🏫 Instructors: ${instructorCount}
   📅 Courses: ${courseCount}
   🎯 CLOs: ${cloCount}
   📊 Skill Collections: ${skillCollectionCount}
  `;
}

// Cleanup function for development
export async function cleanDatabase() {
  console.log('🗑️ Cleaning database...');
  
  await prisma.skill_collection.deleteMany();
  await prisma.clo.deleteMany();
  await prisma.course_instructor.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.plo.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.curriculum_coordinators.deleteMany();
  await prisma.curriculum.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✅ Database cleaned');
}

// Individual seed functions for targeted seeding
export {
  createUsers,
  createFacultiesAndBranches,
  createCurricula,
  createSkills,
  createStudents,
  createSkillCollections,
  createPLOs,
  createSubjects,
  createInstructors,
  createCourses,
  createCourseInstructors,
  createCLOs
};

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
