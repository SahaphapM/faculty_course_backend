import { PrismaClient } from '@prisma/client';

// Import modular seed functions
import { createUsers } from './seeds/user.seed';
import {
  createFacultiesAndBranches,
  createCurricula,
} from './seeds/faculty-branch-curriculum.seed';
import { createSkills } from './seeds/skill.seed';
import { createStudents, createSkillCollections } from './seeds/student.seed';
import { createPLOs } from './seeds/plo.seed';
import { createSubjects } from './seeds/subject.seed';
import { createInstructors } from './seeds/instructor.seed';
import { createCourses, createCourseInstructors } from './seeds/course.seed';
import { createCLOs } from './seeds/clo.seed';
import { createSkillAssessments } from './seeds/skill-assessment.seed';

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

    // 4. Assessment Framework: CLOs, Skill Collections, Skill Assessments
    console.log('\n📊 Phase 4: Assessment Framework');
    await createCLOs();
    await createSkillCollections();
    await createSkillAssessments();

    console.log('\n🎉 Complete database seeding finished successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
