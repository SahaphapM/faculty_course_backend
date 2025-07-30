import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// npm run seed:complete
async function main() {
  console.log('🌱 Starting complete curriculum seed...');

  // 1. สร้าง Faculty
  const faculty = await prisma.faculty.create({
    data: {
      thaiName: 'คณะวิศวกรรมศาสตร์',
      engName: 'Faculty of Engineering',
      thaiDescription: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยบูรพา',
      engDescription: 'Faculty of Engineering, Burapha University',
      abbrev: 'ENG',
    },
  });
  console.log('✅ Created faculty:', faculty.thaiName);

  // 2. สร้าง Branch
  const branch = await prisma.branch.create({
    data: {
      thaiName: 'วิศวกรรมคอมพิวเตอร์',
      engName: 'Computer Engineering',
      thaiDescription: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์',
      engDescription: 'Computer Engineering Branch',
      abbrev: 'CPE',
      facultyId: faculty.id,
    },
  });
  console.log('✅ Created branch:', branch.thaiName);

  // 3. สร้าง Curriculum
  const curriculum = await prisma.curriculum.create({
    data: {
      code: '2567',
      thaiName: 'หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์',
      engName: 'Bachelor of Engineering Program in Computer Engineering',
      thaiDegree: 'วิศวกรรมศาสตรบัณฑิต (วิศวกรรมคอมพิวเตอร์)',
      engDegree: 'Bachelor of Engineering (Computer Engineering)',
      period: 4,
      minimumGrade: 2.00,
      thaiDescription: 'หลักสูตรวิศวกรรมคอมพิวเตอร์ 4 ปี',
      engDescription: '4-year Computer Engineering Program',
      branchId: branch.id,
    },
  });
  console.log('✅ Created curriculum:', curriculum.code);

  // 4. สร้าง Skills (แยกตาม Domain)
  const skills = await prisma.skill.createMany({
    data: [
      // ทักษะ (Psychomotor)
      {
        thaiName: 'การเขียนโปรแกรมคอมพิวเตอร์',
        engName: 'Computer Programming',
        thaiDescription: 'ความสามารถในการเขียนโปรแกรมคอมพิวเตอร์',
        engDescription: 'Ability to write computer programs',
        domain: 'ทักษะ',
        curriculumId: curriculum.id,
      },
      {
        thaiName: 'การออกแบบระบบฐานข้อมูล',
        engName: 'Database System Design',
        thaiDescription: 'ความสามารถในการออกแบบระบบฐานข้อมูล',
        engDescription: 'Ability to design database systems',
        domain: 'ทักษะ',
        curriculumId: curriculum.id,
      },
      {
        thaiName: 'การพัฒนาเว็บแอปพลิเคชัน',
        engName: 'Web Application Development',
        thaiDescription: 'ความสามารถในการพัฒนาเว็บแอปพลิเคชัน',
        engDescription: 'Ability to develop web applications',
        domain: 'ทักษะ',
        curriculumId: curriculum.id,
      },
      {
        thaiName: 'การวิเคราะห์และออกแบบระบบ',
        engName: 'System Analysis and Design',
        thaiDescription: 'ความสามารถในการวิเคราะห์และออกแบบระบบ',
        engDescription: 'Ability to analyze and design systems',
        domain: 'ทักษะ',
        curriculumId: curriculum.id,
      },
      
      // ความรู้ (Cognitive)
      {
        thaiName: 'ความรู้ด้านโครงสร้างข้อมูลและอัลกอริทึม',
        engName: 'Data Structures and Algorithms',
        thaiDescription: 'ความรู้เกี่ยวกับโครงสร้างข้อมูลและอัลกอริทึม',
        engDescription: 'Knowledge of data structures and algorithms',
        domain: 'ความรู้',
        curriculumId: curriculum.id,
      },
      {
        thaiName: 'ความรู้ด้านเครือข่ายคอมพิวเตอร์',
        engName: 'Computer Networks',
        thaiDescription: 'ความรู้เกี่ยวกับเครือข่ายคอมพิวเตอร์',
        engDescription: 'Knowledge of computer networks',
        domain: 'ความรู้',
        curriculumId: curriculum.id,
      },
      {
        thaiName: 'ความรู้ด้านระบบปฏิบัติการ',
        engName: 'Operating Systems',
        thaiDescription: 'ความรู้เกี่ยวกับระบบปฏิบัติการ',
        engDescription: 'Knowledge of operating systems',
        domain: 'ความรู้',
        curriculumId: curriculum.id,
      },
      {
        thaiName: 'ความรู้ด้านการประมวลผลสัญญาณดิจิทัล',
        engName: 'Digital Signal Processing',
        thaiDescription: 'ความรู้เกี่ยวกับการประมวลผลสัญญาณดิจิทัล',
        engDescription: 'Knowledge of digital signal processing',
        domain: 'ความรู้',
        curriculumId: curriculum.id,
      },
      
      // คุณลักษณะบุคคล (Affective)
      {
        thaiName: 'ความรับผิดชอบต่อสังคม',
        engName: 'Social Responsibility',
        thaiDescription: 'ความรับผิดชอบต่อสังคมและสิ่งแวดล้อม',
        engDescription: 'Responsibility to society and environment',
        domain: 'คุณลักษณะบุคคล',
        curriculumId: curriculum.id,
      },
      {
        thaiName: 'การทำงานเป็นทีม',
        engName: 'Teamwork',
        thaiDescription: 'ความสามารถในการทำงานร่วมกับผู้อื่น',
        engDescription: 'Ability to work with others',
        domain: 'คุณลักษณะบุคคล',
        curriculumId: curriculum.id,
      },
      {
        thaiName: 'การสื่อสารอย่างมีประสิทธิภาพ',
        engName: 'Effective Communication',
        thaiDescription: 'ความสามารถในการสื่อสารอย่างมีประสิทธิภาพ',
        engDescription: 'Ability to communicate effectively',
        domain: 'คุณลักษณะบุคคล',
        curriculumId: curriculum.id,
      },
      
      // จริยธรรม (Ethics)
      {
        thaiName: 'จริยธรรมในการใช้เทคโนโลยี',
        engName: 'Technology Ethics',
        thaiDescription: 'จริยธรรมในการใช้และพัฒนาเทคโนโลยี',
        engDescription: 'Ethics in using and developing technology',
        domain: 'จริยธรรม',
        curriculumId: curriculum.id,
      },
      {
        thaiName: 'ความซื่อสัตย์ทางวิชาการ',
        engName: 'Academic Integrity',
        thaiDescription: 'ความซื่อสัตย์ในการทำงานวิชาการ',
        engDescription: 'Integrity in academic work',
        domain: 'จริยธรรม',
        curriculumId: curriculum.id,
      },
    ],
  });
  console.log('✅ Created skills');

  // 5. สร้าง PLOs
  const plos = await prisma.plo.createMany({
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
  });
  console.log('✅ Created PLOs');

  // 6. สร้าง Subjects
  const subjects = await prisma.subject.createMany({
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
        code: 'CPE301',
        curriculumId: curriculum.id,
        thaiName: 'การพัฒนาเว็บแอปพลิเคชัน',
        engName: 'Web Application Development',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'การพัฒนาเว็บแอปพลิเคชันสมัยใหม่',
        engDescription: 'Modern web application development',
      },
      {
        code: 'CPE302',
        curriculumId: curriculum.id,
        thaiName: 'เครือข่ายคอมพิวเตอร์',
        engName: 'Computer Networks',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'หลักการและเทคโนโลยีเครือข่ายคอมพิวเตอร์',
        engDescription: 'Principles and technologies of computer networks',
      },
      {
        code: 'CPE401',
        curriculumId: curriculum.id,
        thaiName: 'ระบบฐานข้อมูล',
        engName: 'Database Systems',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'การออกแบบและจัดการระบบฐานข้อมูล',
        engDescription: 'Database system design and management',
      },
      {
        code: 'CPE402',
        curriculumId: curriculum.id,
        thaiName: 'จริยธรรมและความปลอดภัยทางไซเบอร์',
        engName: 'Cybersecurity and Ethics',
        credit: '3(2-2-5)',
        type: 'บังคับ',
        thaiDescription: 'จริยธรรมและความปลอดภัยในการใช้เทคโนโลยี',
        engDescription: 'Ethics and security in technology use',
      },
    ],
  });
  console.log('✅ Created subjects');

  // 7. สร้าง Instructors
  const instructors = await prisma.instructor.createMany({
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
  });
  console.log('✅ Created instructors');

  // 8. สร้าง Students (รุ่น 67)
  const students = await prisma.student.createMany({
    data: [
      {
        code: '6760123456',
        thaiName: 'นายวิชัย ใจดี',
        engName: 'Mr. Wichai Jaidee',
        enrollmentDate: new Date('2024-06-01'),
        curriculumId: curriculum.id,
        branchId: branch.id,
      },
      {
        code: '6760123457',
        thaiName: 'นางสาววิชิดา รักดี',
        engName: 'Ms. Wichida Rakdee',
        enrollmentDate: new Date('2024-06-01'),
        curriculumId: curriculum.id,
        branchId: branch.id,
      },
      {
        code: '6760123458',
        thaiName: 'นายวิชัย เก่งดี',
        engName: 'Mr. Wichai Kengdee',
        enrollmentDate: new Date('2024-06-01'),
        curriculumId: curriculum.id,
        branchId: branch.id,
      },
      {
        code: '6760123459',
        thaiName: 'นางสาววิชิดา สวยดี',
        engName: 'Ms. Wichida Suaydee',
        enrollmentDate: new Date('2024-06-01'),
        curriculumId: curriculum.id,
        branchId: branch.id,
      },
      {
        code: '6760123460',
        thaiName: 'นายวิชัย ฉลาดดี',
        engName: 'Mr. Wichai Chaladdee',
        enrollmentDate: new Date('2024-06-01'),
        curriculumId: curriculum.id,
        branchId: branch.id,
      },
    ],
  });
  console.log('✅ Created students');

  // 9. สร้าง Courses
  const courses = await prisma.course.createMany({
    data: [
      {
        subjectId: 1, // CPE101
        active: true,
        semester: 1,
        year: 2024,
      },
      {
        subjectId: 2, // CPE102
        active: true,
        semester: 2,
        year: 2024,
      },
      {
        subjectId: 3, // CPE201
        active: true,
        semester: 1,
        year: 2025,
      },
      {
        subjectId: 4, // CPE202
        active: true,
        semester: 2,
        year: 2025,
      },
      {
        subjectId: 5, // CPE301
        active: true,
        semester: 1,
        year: 2026,
      },
      {
        subjectId: 6, // CPE302
        active: true,
        semester: 2,
        year: 2026,
      },
      {
        subjectId: 7, // CPE401
        active: true,
        semester: 1,
        year: 2027,
      },
      {
        subjectId: 8, // CPE402
        active: true,
        semester: 2,
        year: 2027,
      },
    ],
  });
  console.log('✅ Created courses');

  // 10. สร้าง Course Instructors
  const courseInstructors = await prisma.course_instructor.createMany({
    data: [
      { instructorId: 1, courseId: 1 },
      { instructorId: 1, courseId: 2 },
      { instructorId: 2, courseId: 3 },
      { instructorId: 2, courseId: 4 },
      { instructorId: 3, courseId: 5 },
      { instructorId: 3, courseId: 6 },
      { instructorId: 1, courseId: 7 },
      { instructorId: 2, courseId: 8 },
    ],
  });
  console.log('✅ Created course instructors');

  // 11. สร้าง CLOs และเชื่อมโยงกับ Skills
  const createdSkills = await prisma.skill.findMany({
    where: { curriculumId: curriculum.id },
  });

  const createdPlos = await prisma.plo.findMany({
    where: { curriculumId: curriculum.id },
  });

  const clos = await prisma.clo.createMany({
    data: [
      // CPE101 - การเขียนโปรแกรมคอมพิวเตอร์ 1
      {
        name: 'CLO1.1',
        ploId: createdPlos[1].id, // PLO2 (ทักษะ)
        subjectId: 1,
        skillId: createdSkills[0].id, // การเขียนโปรแกรมคอมพิวเตอร์
        thaiDescription: 'สามารถเขียนโปรแกรมคอมพิวเตอร์พื้นฐานได้',
        engDescription: 'Can write basic computer programs',
        expectSkillLevel: 3,
      },
      {
        name: 'CLO1.2',
        ploId: createdPlos[0].id, // PLO1 (ความรู้)
        subjectId: 1,
        skillId: createdSkills[4].id, // โครงสร้างข้อมูลและอัลกอริทึม
        thaiDescription: 'เข้าใจหลักการเขียนโปรแกรม',
        engDescription: 'Understand programming principles',
        expectSkillLevel: 2,
      },

      // CPE102 - การเขียนโปรแกรมคอมพิวเตอร์ 2
      {
        name: 'CLO2.1',
        ploId: createdPlos[1].id, // PLO2 (ทักษะ)
        subjectId: 2,
        skillId: createdSkills[0].id, // การเขียนโปรแกรมคอมพิวเตอร์
        thaiDescription: 'สามารถเขียนโปรแกรมเชิงวัตถุได้',
        engDescription: 'Can write object-oriented programs',
        expectSkillLevel: 4,
      },

      // CPE201 - โครงสร้างข้อมูลและอัลกอริทึม
      {
        name: 'CLO3.1',
        ploId: createdPlos[0].id, // PLO1 (ความรู้)
        subjectId: 3,
        skillId: createdSkills[4].id, // โครงสร้างข้อมูลและอัลกอริทึม
        thaiDescription: 'เข้าใจโครงสร้างข้อมูลและอัลกอริทึม',
        engDescription: 'Understand data structures and algorithms',
        expectSkillLevel: 3,
      },

      // CPE202 - การวิเคราะห์และออกแบบระบบ
      {
        name: 'CLO4.1',
        ploId: createdPlos[1].id, // PLO2 (ทักษะ)
        subjectId: 4,
        skillId: createdSkills[3].id, // การวิเคราะห์และออกแบบระบบ
        thaiDescription: 'สามารถวิเคราะห์และออกแบบระบบได้',
        engDescription: 'Can analyze and design systems',
        expectSkillLevel: 3,
      },

      // CPE301 - การพัฒนาเว็บแอปพลิเคชัน
      {
        name: 'CLO5.1',
        ploId: createdPlos[1].id, // PLO2 (ทักษะ)
        subjectId: 5,
        skillId: createdSkills[2].id, // การพัฒนาเว็บแอปพลิเคชัน
        thaiDescription: 'สามารถพัฒนาเว็บแอปพลิเคชันได้',
        engDescription: 'Can develop web applications',
        expectSkillLevel: 4,
      },

      // CPE302 - เครือข่ายคอมพิวเตอร์
      {
        name: 'CLO6.1',
        ploId: createdPlos[0].id, // PLO1 (ความรู้)
        subjectId: 6,
        skillId: createdSkills[5].id, // เครือข่ายคอมพิวเตอร์
        thaiDescription: 'เข้าใจหลักการเครือข่ายคอมพิวเตอร์',
        engDescription: 'Understand computer network principles',
        expectSkillLevel: 3,
      },

      // CPE401 - ระบบฐานข้อมูล
      {
        name: 'CLO7.1',
        ploId: createdPlos[1].id, // PLO2 (ทักษะ)
        subjectId: 7,
        skillId: createdSkills[1].id, // การออกแบบระบบฐานข้อมูล
        thaiDescription: 'สามารถออกแบบระบบฐานข้อมูลได้',
        engDescription: 'Can design database systems',
        expectSkillLevel: 4,
      },

      // CPE402 - จริยธรรมและความปลอดภัยทางไซเบอร์
      {
        name: 'CLO8.1',
        ploId: createdPlos[3].id, // PLO4 (จริยธรรม)
        subjectId: 8,
        skillId: createdSkills[11].id, // จริยธรรมในการใช้เทคโนโลยี
        thaiDescription: 'มีจริยธรรมในการใช้เทคโนโลยี',
        engDescription: 'Have ethics in using technology',
        expectSkillLevel: 4,
      },
      {
        name: 'CLO8.2',
        ploId: createdPlos[2].id, // PLO3 (คุณลักษณะบุคคล)
        subjectId: 8,
        skillId: createdSkills[8].id, // ความรับผิดชอบต่อสังคม
        thaiDescription: 'มีความรับผิดชอบต่อสังคม',
        engDescription: 'Have responsibility to society',
        expectSkillLevel: 4,
      },
    ],
  });
  console.log('✅ Created CLOs');

  // 12. สร้าง Skill Collections (ข้อมูลการประเมินทักษะ)
  const createdClos = await prisma.clo.findMany();
  const createdStudents = await prisma.student.findMany();
  const createdCourses = await prisma.course.findMany();

  const skillCollections = [];
  
  // สร้างข้อมูล skill_collection สำหรับแต่ละนักเรียน
  for (const student of createdStudents) {
    for (const clo of createdClos) {
      // สุ่ม gainedLevel ระหว่าง 1-5
      const gainedLevel = Math.floor(Math.random() * 5) + 1;
      const passed = gainedLevel >= 3; // ผ่านถ้าได้ 3 ขึ้นไป
      
      // หา course ที่เกี่ยวข้องกับ subject ของ CLO
      const relatedCourse = createdCourses.find(course => course.subjectId === clo.subjectId);
      
      if (relatedCourse) {
        skillCollections.push({
          studentId: student.id,
          cloId: clo.id,
          courseId: relatedCourse.id,
          gainedLevel,
          passed,
        });
      }
    }
  }

  await prisma.skill_collection.createMany({
    data: skillCollections,
  });
  console.log('✅ Created skill collections');

  // 13. สร้าง Curriculum Coordinators
  const curriculumCoordinators = await prisma.curriculum_coordinators.createMany({
    data: [
      { instructorId: 1, curriculumId: curriculum.id },
      { instructorId: 2, curriculumId: curriculum.id },
    ],
  });
  console.log('✅ Created curriculum coordinators');

  console.log('🎉 Complete curriculum seed finished successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - Faculty: ${faculty.thaiName}`);
  console.log(`   - Branch: ${branch.thaiName}`);
  console.log(`   - Curriculum: ${curriculum.code} - ${curriculum.thaiName}`);
  console.log(`   - Skills: ${createdSkills.length} skills`);
  console.log(`   - PLOs: ${createdPlos.length} PLOs`);
  console.log(`   - Subjects: 8 subjects`);
  console.log(`   - Instructors: 3 instructors`);
  console.log(`   - Students: ${createdStudents.length} students (รุ่น 67)`);
  console.log(`   - Courses: ${createdCourses.length} courses`);
  console.log(`   - CLOs: ${createdClos.length} CLOs`);
  console.log(`   - Skill Collections: ${skillCollections.length} records`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 