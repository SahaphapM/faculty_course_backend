import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function loadData(fileName: string) {
  const filePath = path.join(__dirname, fileName);
  const rawData = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(rawData);
}

export async function createSkillsAndStudents() {
  console.log('🌱 Starting skills and students seeding...');

  // Get the first curriculum to link skills and students
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run the main seed first.');
  }

  const branch = await prisma.branch.findFirst({ 
    where: { id: curriculum.branchId } 
  });
  if (!branch) {
    throw new Error('No branch found for curriculum');
  }

  // Load skills data from fixture
  const skillsData = await loadData('fixture/skills.json');
  
  // Create skills with curriculum reference
  const skillsToCreate = skillsData.map((skill: any) => ({
    ...skill,
    curriculumId: curriculum.id,
  }));

  await prisma.skill.createMany({
    data: skillsToCreate,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${skillsToCreate.length} skills`);

  // Load students data from fixture
  const studentsData = await loadData('fixture/student.json');

  // Create students
  const studentsToCreate = studentsData.map((student: any) => ({
    code: student.code,
    thaiName: student.thaiName,
    engName: student.engName,
    enrollmentDate: new Date(student.enrollmentDate),
    curriculumId: curriculum.id,
    branchId: branch.id,
  }));

  const createdStudents = [];
  for (const studentData of studentsToCreate) {
    const student = await prisma.student.create({
      data: studentData,
    });
    createdStudents.push(student);
  }
  console.log(`✅ Created ${createdStudents.length} students`);

  // Get all created skills
  const allSkills = await prisma.skill.findMany({ 
    where: { curriculumId: curriculum.id } 
  });

  // Create skill collections (link all skills to each student)
  const skillCollections = [];
  for (const student of createdStudents) {
    for (const skill of allSkills) {
      // Generate random skill levels (1-5) with realistic distribution
      const random = Math.random();
      let gainedLevel;
      
      // 60% chance for level 3-4 (competent)
      if (random < 0.6) {
        gainedLevel = Math.floor(Math.random() * 2) + 3; // 3-4
      }
      // 25% chance for level 2-3 (developing)
      else if (random < 0.85) {
        gainedLevel = Math.floor(Math.random() * 2) + 2; // 2-3
      }
      // 15% chance for level 4-5 (advanced)
      else {
        gainedLevel = Math.floor(Math.random() * 2) + 4; // 4-5
      }

      skillCollections.push({
        studentId: student.id,
        gainedLevel,
        passed: gainedLevel >= 3,
        cloId: null,
        courseId: null,
      });
    }
  }

  await prisma.skill_collection.createMany({
    data: skillCollections,
  });
  console.log(`✅ Created ${skillCollections.length} skill collection records`);

  console.log('🎉 Skills and students seeding completed!');
  console.log(`📊 Summary:`);
  console.log(`   - Skills: ${allSkills.length} (15 hard skills + 15 soft skills)`);
  console.log(`   - Students: ${createdStudents.length}`);
  console.log(`   - Skill Collections: ${skillCollections.length} records`);
}

export async function createPLOs() {
  console.log('🌱 Creating PLOs...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run the main seed first.');
  }

  await prisma.plo.createMany({
    data: [
      {
        curriculumId: curriculum.id,
        type: 'ความรู้',
        name: 'PLO1',
        thaiDescription: 'มีความรู้และความเข้าใจในหลักการและทฤษฎีที่สำคัญในสาขาวิชาวิศวกรรมคอมพิวเตอร์',
        engDescription: 'Have knowledge and understanding of important principles and theories in computer engineering',
      },
      {
        curriculumId: curriculum.id,
        type: 'ทักษะ',
        name: 'PLO2',
        thaiDescription: 'มีความสามารถในการวิเคราะห์ปัญหาและออกแบบระบบคอมพิวเตอร์',
        engDescription: 'Have ability to analyze problems and design computer systems',
      },
      {
        curriculumId: curriculum.id,
        type: 'คุณลักษณะบุคคล',
        name: 'PLO3',
        thaiDescription: 'มีความรับผิดชอบต่อสังคมและสิ่งแวดล้อม',
        engDescription: 'Have responsibility to society and environment',
      },
      {
        curriculumId: curriculum.id,
        type: 'จริยธรรม',
        name: 'PLO4',
        thaiDescription: 'มีจริยธรรมในการใช้และพัฒนาเทคโนโลยี',
        engDescription: 'Have ethics in using and developing technology',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created PLOs');
}

export async function createSubjects() {
  console.log('🌱 Creating subjects...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run the main seed first.');
  }

  await prisma.subject.createMany({
    data: [
      {
        code: 'CPE101',
        curriculumId: curriculum.id,
        thaiName: 'การเขียนโปรแกรมคอมพิวเตอร์ 1',
        engName: 'Computer Programming I',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'พื้นฐานการเขียนโปรแกรมคอมพิวเตอร์',
        engDescription: 'Fundamentals of computer programming',
      },
      {
        code: 'CPE102',
        curriculumId: curriculum.id,
        thaiName: 'การเขียนโปรแกรมคอมพิวเตอร์ 2',
        engName: 'Computer Programming II',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'การเขียนโปรแกรมเชิงวัตถุ',
        engDescription: 'Object-oriented programming',
      },
      {
        code: 'CPE201',
        curriculumId: curriculum.id,
        thaiName: 'โครงสร้างข้อมูลและอัลกอริทึม',
        engName: 'Data Structures and Algorithms',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'โครงสร้างข้อมูลและอัลกอริทึมพื้นฐาน',
        engDescription: 'Basic data structures and algorithms',
      },
      {
        code: 'CPE202',
        curriculumId: curriculum.id,
        thaiName: 'การวิเคราะห์และออกแบบระบบ',
        engName: 'System Analysis and Design',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'การวิเคราะห์และออกแบบระบบสารสนเทศ',
        engDescription: 'Information system analysis and design',
      },
      {
        code: 'CPE203',
        curriculumId: curriculum.id,
        thaiName: 'การทดสอบซอฟต์แวร์',
        engName: 'Software Testing',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'หลักการและเทคนิคการทดสอบซอฟต์แวร์',
        engDescription: 'Principles and techniques of software testing',
      },
      {
        code: 'CPE301',
        curriculumId: curriculum.id,
        thaiName: 'การพัฒนาเว็บแอปพลิเคชัน',
        engName: 'Web Application Development',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'การพัฒนาเว็บแอปพลิเคชันสมัยใหม่',
        engDescription: 'Modern web application development',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created subjects');
}

export async function createInstructors() {
  console.log('🌱 Creating instructors...');
  
  const branch = await prisma.branch.findFirst();
  if (!branch) {
    throw new Error('No branch found. Please run the main seed first.');
  }

  await prisma.instructor.createMany({
    data: [
      {
        branchId: branch.id,
        code: 'INS001',
        thaiName: 'ดร.สมชาย ใจดี',
        engName: 'Dr. Somchai Jaidee',
        tel: '038-123-4567',
        position: 'อาจารย์',
        email: 'somchai@buu.ac.th',
      },
      {
        branchId: branch.id,
        code: 'INS002',
        thaiName: 'ดร.สมหญิง รักดี',
        engName: 'Dr. Somying Rakdee',
        tel: '038-123-4568',
        position: 'อาจารย์',
        email: 'somying@buu.ac.th',
      },
      {
        branchId: branch.id,
        code: 'INS003',
        thaiName: 'ดร.สมศักดิ์ เก่งดี',
        engName: 'Dr. Somsak Kengdee',
        tel: '038-123-4569',
        position: 'อาจารย์',
        email: 'somsak@buu.ac.th',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created instructors');
}

export async function createCoursesAndCLOs() {
  console.log('🌱 Creating courses and CLOs...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run the main seed first.');
  }

  // Get created subjects, PLOs, skills, and instructors
  const createdSubjects = await prisma.subject.findMany({
    where: { curriculumId: curriculum.id },
  });
  const createdPlos = await prisma.plo.findMany({
    where: { curriculumId: curriculum.id },
  });
  const createdSkills = await prisma.skill.findMany({
    where: { curriculumId: curriculum.id },
  });
  const createdInstructors = await prisma.instructor.findMany();

  if (createdSubjects.length === 0) {
    throw new Error('No subjects found. Please create subjects first.');
  }

  // Create courses
  const courses = await prisma.course.createMany({
    data: createdSubjects.slice(0, 6).map((subject, index) => ({
      subjectId: subject.id,
      active: true,
      semester: (index % 2) + 1,
      year: 2024 + Math.floor(index / 2),
    })),
  });
  console.log('✅ Created courses');

  // Get created courses
  const allCourses = await prisma.course.findMany();

  // Create course instructors
  if (createdInstructors.length > 0 && allCourses.length > 0) {
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

  // Create some sample CLOs linking skills to subjects
  if (createdPlos.length > 0 && createdSkills.length > 0 && createdSubjects.length > 0) {
    const cloData = [];
    
    // Create 2 CLOs per subject (first 6 subjects)
    for (let i = 0; i < Math.min(6, createdSubjects.length); i++) {
      const subject = createdSubjects[i];
      const hardSkills = createdSkills.filter(s => s.domain === 'hard-skill');
      const softSkills = createdSkills.filter(s => s.domain === 'soft-skill');
      
      // CLO 1: Hard skill
      if (hardSkills.length > i) {
        cloData.push({
          name: `CLO${i + 1}.1`,
          ploId: createdPlos[1]?.id || createdPlos[0].id, // PLO2 (ทักษะ) or first PLO
          subjectId: subject.id,
          skillId: hardSkills[i % hardSkills.length].id,
          thaiDescription: `สามารถ${hardSkills[i % hardSkills.length].thaiName}ได้`,
          engDescription: `Can ${hardSkills[i % hardSkills.length].engName}`,
          expectSkillLevel: 3 + (i % 3), // 3-5
        });
      }
      
      // CLO 2: Soft skill
      if (softSkills.length > i) {
        cloData.push({
          name: `CLO${i + 1}.2`,
          ploId: createdPlos[2]?.id || createdPlos[0].id, // PLO3 (คุณลักษณะบุคคล) or first PLO
          subjectId: subject.id,
          skillId: softSkills[i % softSkills.length].id,
          thaiDescription: `มี${softSkills[i % softSkills.length].thaiName}`,
          engDescription: `Have ${softSkills[i % softSkills.length].engName}`,
          expectSkillLevel: 3 + (i % 2), // 3-4
        });
      }
    }

    if (cloData.length > 0) {
      await prisma.clo.createMany({
        data: cloData,
        skipDuplicates: true,
      });
      console.log(`✅ Created ${cloData.length} CLOs`);
    }
  }

  console.log('🎉 Courses and CLOs creation completed!');
}

async function main() {
  await createSkillsAndStudents();
  await createPLOs();
  await createSubjects();
  await createInstructors();
  await createCoursesAndCLOs();
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error during skills and students seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
