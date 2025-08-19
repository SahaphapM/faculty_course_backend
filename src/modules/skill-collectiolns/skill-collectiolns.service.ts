import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClosService } from '../clos/clos.service';
import { createPaginatedData } from 'src/utils/paginated.utils';
import { StudentScoreList } from 'src/dto/filters/filter.base.dto';
import { SkillCollectionDto } from 'src/generated/nestjs-dto/skillCollection.dto';
import { Prisma } from '@prisma/client';
import { SkillCollectionsHelper } from './skill-collectiolns.helper';
import { LearningDomain } from 'src/enums/learning-domain.enum';
import { SkillNode } from './skill-collectiolns.helper';
import { SkillCollectionByCourseFilterDto } from 'src/dto/filters/filter.skill-collection-summary.dto';

@Injectable()
export class SkillCollectionsService {
  constructor(
    private prisma: PrismaService,
    private skillCollectionsHelper: SkillCollectionsHelper,
  ) {}

  async getTranscriptFromAssessment(
    studentCode: string,
  ): Promise<{ specific: SkillNode[]; soft: SkillNode[] }> {
    const student = await this.prisma.student.findUnique({
      where: { code: studentCode },
      select: {
        id: true,
        curriculumId: true,
      },
    });

    console.log('Student:', student);

    if (!student) {
      throw new NotFoundException(`Student with code ${studentCode} not found`);
    }

    // 2. ดึง skill_collection ของ student (สำหรับ subskills)
    const skillCollections = await this.prisma.skill_collection.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        gainedLevel: true,
        clo: { select: { skill: { select: { id: true } } } },
      },
    });

    const skill_assessments = await this.prisma.skill_assessment.findMany({
      where: { studentId: student.id },
      include: {
        skill: true,
      },
    });

    // 3. คำนวณ root skill assessment จาก leaf skill ของ student
    const skillTree = await this.skillCollectionsHelper.skillTree(
      skillCollections,
      skill_assessments,
    );

    // filter root where gainedLevel > 0
    const filteredSkillTree = Array.from(skillTree.values()).filter(
      (skill) => skill.gained > 0,
    );

    // 12. แยก specific (hard) และ soft skill
    const specific = filteredSkillTree.filter(
      (r) =>
        r.domain === LearningDomain.Cognitive ||
        r.domain === LearningDomain.Psychomotor,
    );

    const soft = filteredSkillTree.filter(
      (r) =>
        r.domain === LearningDomain.Affective ||
        r.domain === LearningDomain.Ethics,
    );

    console.log('=== [DEBUG] Specific Skill Tree ===');
    console.dir(specific, { depth: 10 });

    console.log('=== [DEBUG] Soft Skill Tree ===');
    console.dir(soft, { depth: 10 });

    return { specific, soft };
  }

  async getByCloId(
    courseId: number,
    cloId: number,
  ): Promise<Partial<SkillCollectionDto>[]> {
    return this.prisma.skill_collection.findMany({
      where: { courseId, cloId },
      select: {
        id: true,
        gainedLevel: true,
        passed: true,
        student: {
          select: {
            code: true,
            thaiName: true,
          },
        },
      },
      orderBy: { student: { code: 'asc' } },
    });
  }

  // import skill collections for students by clo id
  async importSkillCollections(
    courseId: number,
    cloId: number,
    studentScoreList: StudentScoreList[],
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        subjectId: true,
        subject: {
          select: {
            curriculumId: true,
            curriculum: {
              select: {
                branchId: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (!course.subjectId) {
      throw new NotFoundException(
        `Subject with ID ${course.subjectId} not found`,
      );
    }

    const clo = await this.prisma.clo.findUnique({
      where: { id: cloId },
    });

    if (!clo) {
      throw new NotFoundException(`CLO with ID ${cloId} not found`);
    }

    const rootSkills = await this.prisma.skill.findMany({
      where: { parent: null, curriculumId: course.subject.curriculumId },
      select: {
        id: true,
        parentId: true,
        domain: true,
        thaiName: true,
        engName: true,
      },
    });

    const skillCollections = [];

    for (const studentScore of studentScoreList) {
      // 1. หา student หรือสร้างใหม่
      let student = await this.prisma.student.findUnique({
        where: { code: studentScore.studentCode },
      });

      if (!student) {
        student = await this.prisma.student.create({
          data: {
            code: studentScore.studentCode,
            curriculumId: course.subject.curriculumId,
            branchId: course.subject.curriculum.branchId,
          },
        });
      }

      // 2. ดึง skill_collections ของ student

      const skillCollection = await this.prisma.skill_collection.findFirst({
        where: { studentId: student.id, courseId: course.id, cloId: clo.id },
      });

      let skillCollections = [];

      // 4. compare skillCollection.gainedLevel with studentScore.gainedLevel
      if (skillCollection) {
        if (skillCollection.gainedLevel !== studentScore.gainedLevel) {
          await this.prisma.skill_collection.update({
            where: { id: skillCollection.id },
            data: {
              gainedLevel: studentScore.gainedLevel,
              passed: studentScore.gainedLevel >= clo.expectSkillLevel,
            },
          });

          skillCollection.gainedLevel = studentScore.gainedLevel;
          skillCollection.passed =
            studentScore.gainedLevel >= clo.expectSkillLevel;

          await this.skillCollectionsHelper.syncStudentSkillAssessments(
            student.id,
            rootSkills,
            skillCollections,
          );

          skillCollections = await this.prisma.skill_collection.findMany({
            where: { studentId: student.id },
            include: {
              clo: {
                include: {
                  skill: true,
                },
              },
            },
          });
        }
      } else {
        const newSkillCollection = await this.prisma.skill_collection.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            cloId: clo.id,
            gainedLevel: studentScore.gainedLevel,
            passed: studentScore.gainedLevel >= clo.expectSkillLevel,
          },
          include: {
            clo: {
              include: {
                skill: true,
              },
            },
          },
        });

        skillCollections.push(newSkillCollection);

        await this.skillCollectionsHelper.syncStudentSkillAssessments(
          student.id,
          rootSkills,
          skillCollections,
        );

        skillCollections = await this.prisma.skill_collection.findMany({
          where: { studentId: student.id },
          include: {
            clo: {
              include: {
                skill: true,
              },
            },
          },
        });
      }
    }
  }

  async generateTestData() {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // 1. Create curriculum with branchId = 2
          const curriculum = await tx.curriculum.create({
            data: {
              branchId: 2,
              code: 'CS2024-TEST',
              thaiName:
                'หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ข้อมูลทดสอบ)',
              engName:
                'Bachelor of Science Program in Computer Science (Test Data)',
              thaiDegree: 'วิทยาศาสตรบัณฑิต',
              engDegree: 'Bachelor of Science',
              period: 4,
              minimumGrade: new Prisma.Decimal(2.0),
              thaiDescription:
                'หลักสูตรที่เน้นการพัฒนาทักษะด้านวิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ',
              engDescription:
                'A program focused on developing computer science and information technology skills',
            },
          });

          // 2. Generate coordinators (instructors)
          const coordinatorData = [
            {
              branchId: 2,
              code: 'INST001',
              thaiName: 'ผศ.ดร.สมชาย วิทยาการ',
              engName: 'Asst.Prof.Dr.Somchai Wittayakan',
              email: 'somchai.w@university.ac.th',
              position: 'ผู้ช่วยศาสตราจารย์',
              tel: '02-123-4567',
            },
            {
              branchId: 2,
              code: 'INST002',
              thaiName: 'อ.ดร.สุดา เทคโนโลยี',
              engName: 'Dr.Suda Technology',
              email: 'suda.t@university.ac.th',
              position: 'อาจารย์',
              tel: '02-123-4568',
            },
            {
              branchId: 2,
              code: 'INST003',
              thaiName: 'ผศ.วิชัย คอมพิวเตอร์',
              engName: 'Asst.Prof.Wichai Computer',
              email: 'wichai.c@university.ac.th',
              position: 'ผู้ช่วยศาสตราจารย์',
              tel: '02-123-4569',
            },
          ];

          const coordinators = [];
          for (const coordData of coordinatorData) {
            const coordinator = await tx.instructor.create({ data: coordData });
            coordinators.push(coordinator);

            // Assign as curriculum coordinator
            await tx.curriculum_coordinators.create({
              data: {
                // instructorId: coordinator.id,
                coordinatorId: coordinator.id,
                curriculumId: curriculum.id,
              },
            });
          }

          // 3. Generate 100 students
          const thaiFirstNames = [
            'กิตติพงษ์',
            'นรินทร์',
            'ศิริพร',
            'ปิยะพงษ์',
            'สุชาดา',
            'อัญชลี',
            'ธนพล',
            'วิภาวี',
            'จิราพร',
            'สมชาย',
            'อนุวัฒน์',
            'พัชรินทร์',
            'วรพล',
            'สุภาพร',
            'นฤมล',
            'พรชัย',
            'สุวรรณา',
            'ศักดิ์ชัย',
            'จิตรลดา',
            'พีรพล',
            'ณัฐวุฒิ',
            'วราภรณ์',
            'สุกฤษณ์',
            'สุพัตรา',
            'อรพินท์',
            'นพรัตน์',
            'ศราวุธ',
            'ดวงกมล',
            'ปรีชา',
            'ชลธิชา',
          ];

          const thaiLastNames = [
            'ทองสุข',
            'ใจดี',
            'กิตติวัฒน์',
            'บุญมี',
            'วัฒนกูล',
            'อินทรัตน์',
            'เจริญสุข',
            'สุนทร',
            'รัตนสกุล',
            'จิตติเดช',
            'เพชรดี',
            'ปัญญาไว',
            'วงศ์สุวรรณ',
            'โสภณ',
            'ชนะชัย',
            'ธีรพงศ์',
            'ศรีสวัสดิ์',
            'พงษ์ศักดิ์',
            'บวรสุข',
            'มหาพรหม',
            'ชาญณรงค์',
            'มงคลชัย',
            'สุขเกษม',
            'กุลบุตร',
            'วิเศษศรี',
          ];

          const engFirstNames = [
            'John',
            'Jane',
            'Michael',
            'Sarah',
            'David',
            'Lisa',
            'Robert',
            'Emily',
            'James',
            'Jessica',
            'William',
            'Ashley',
            'Richard',
            'Amanda',
            'Thomas',
            'Stephanie',
            'Christopher',
            'Jennifer',
            'Daniel',
            'Nicole',
            'Matthew',
            'Elizabeth',
            'Anthony',
            'Helen',
            'Mark',
            'Samantha',
            'Donald',
            'Rachel',
            'Steven',
            'Laura',
          ];

          const engLastNames = [
            'Smith',
            'Johnson',
            'Williams',
            'Brown',
            'Jones',
            'Garcia',
            'Miller',
            'Davis',
            'Rodriguez',
            'Martinez',
            'Hernandez',
            'Lopez',
            'Gonzalez',
            'Wilson',
            'Anderson',
            'Thomas',
            'Taylor',
            'Moore',
            'Jackson',
            'Martin',
            'Lee',
            'Perez',
            'Thompson',
            'White',
            'Harris',
            'Sanchez',
            'Clark',
            'Ramirez',
            'Lewis',
            'Robinson',
          ];

          // Prepare student data for bulk creation
          const studentsData = [];
          for (let i = 1; i <= 100; i++) {
            const studentCode = `6716${i.toString().padStart(4, '0')}`; // example: 67160001, 67160002, ... 67160100
            const thaiFirstName =
              thaiFirstNames[Math.floor(Math.random() * thaiFirstNames.length)];
            const thaiLastName =
              thaiLastNames[Math.floor(Math.random() * thaiLastNames.length)];
            const engFirstName =
              engFirstNames[Math.floor(Math.random() * engFirstNames.length)];
            const engLastName =
              engLastNames[Math.floor(Math.random() * engLastNames.length)];

            studentsData.push({
              code: studentCode,
              thaiName: `${thaiFirstName} ${thaiLastName}`,
              engName: `${engFirstName} ${engLastName}`,
              curriculumId: curriculum.id,
              branchId: 2,
              enrollmentDate: new Date('2024-06-01'),
              socials: {
                email: `${studentCode}@go.buu.ac.th`,
              },
            });
          }

          // Bulk create students
          await tx.student.createMany({
            data: studentsData,
          });

          // Fetch created students to get their IDs
          const students = await tx.student.findMany({
            where: {
              curriculumId: curriculum.id,
              code: {
                startsWith: '6716',
              },
            },
          });

          // 4. Generate PLOs (Program Learning Outcomes)
          const ploData = [
            {
              curriculumId: curriculum.id,
              type: 'ความรู้',
              name: 'PLO1',
              thaiDescription:
                'มีความรู้ความเข้าใจในหลักการและทฤษฎีพื้นฐานของวิทยาการคอมพิวเตอร์',
              engDescription:
                'Understanding fundamental principles and theories of computer science',
            },
            {
              curriculumId: curriculum.id,
              type: 'ทักษะ',
              name: 'PLO2',
              thaiDescription:
                'สามารถวิเคราะห์ ออกแบบ และพัฒนาระบบซอฟต์แวร์ได้อย่างมีประสิทธิภาพ',
              engDescription:
                'Ability to analyze, design, and develop software systems efficiently',
            },
            {
              curriculumId: curriculum.id,
              type: 'คุณลักษณะบุคคล',
              name: 'PLO3',
              thaiDescription:
                'มีความสามารถในการทำงานเป็นทีมและการสื่อสารอย่างมีประสิทธิภาพ',
              engDescription: 'Teamwork and effective communication skills',
            },
            {
              curriculumId: curriculum.id,
              type: 'จริยธรรม',
              name: 'PLO4',
              thaiDescription: 'มีจริยธรรมและความรับผิดชอบในการใช้เทคโนโลยี',
              engDescription: 'Ethics and responsibility in technology usage',
            },
          ];

          const plos = [];
          for (const ploInfo of ploData) {
            const plo = await tx.plo.create({ data: ploInfo });
            plos.push(plo);
          }

          // 5. Generate 3-level skills hierarchy
          const skills = [];

          // Root skills (Level 1)
          const rootSkillsData = [
            // ความรู้ domain
            {
              thaiName: 'ความรู้พื้นฐานคอมพิวเตอร์',
              engName: 'Computer Fundamentals',
              thaiDescription:
                'ความรู้พื้นฐานเกี่ยวกับระบบคอมพิวเตอร์และการทำงาน',
              engDescription:
                'Basic knowledge of computer systems and operations',
              domain: 'ความรู้',
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'ความรู้ด้านการเขียนโปรแกรม',
              engName: 'Programming Knowledge',
              thaiDescription:
                'ความรู้เกี่ยวกับภาษาการเขียนโปรแกรมและเทคนิคการพัฒนา',
              engDescription:
                'Knowledge of programming languages and development techniques',
              domain: 'ความรู้',
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'ความรู้ด้านฐานข้อมูล',
              engName: 'Database Knowledge',
              thaiDescription: 'ความรู้เกี่ยวกับการออกแบบและจัดการฐานข้อมูล',
              engDescription: 'Knowledge of database design and management',
              domain: 'ความรู้',
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'ความรู้ด้านเครือข่าย',
              engName: 'Network Knowledge',
              thaiDescription: 'ความรู้เกี่ยวกับระบบเครือข่ายและการสื่อสาร',
              engDescription: 'Knowledge of network systems and communication',
              domain: 'ความรู้',
              curriculumId: curriculum.id,
            },
            // ทักษะ domain
            {
              thaiName: 'ทักษะการเขียนโปรแกรม',
              engName: 'Programming Skills',
              thaiDescription: 'ทักษะในการเขียนและพัฒนาโปรแกรมคอมพิวเตอร์',
              engDescription:
                'Skills in writing and developing computer programs',
              domain: 'ทักษะ',
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'ทักษะการแก้ปัญหา',
              engName: 'Problem Solving Skills',
              thaiDescription: 'ทักษะในการวิเคราะห์และแก้ไขปัญหาทางเทคนิค',
              engDescription:
                'Skills in analyzing and solving technical problems',
              domain: 'ทักษะ',
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'ทักษะการออกแบบระบบ',
              engName: 'System Design Skills',
              thaiDescription: 'ทักษะในการออกแบบและพัฒนาระบบซอฟต์แวร์',
              engDescription:
                'Skills in designing and developing software systems',
              domain: 'ทักษะ',
              curriculumId: curriculum.id,
            },
            // คุณลักษณะบุคคล domain
            {
              thaiName: 'การทำงานเป็นทีม',
              engName: 'Teamwork',
              thaiDescription:
                'ความสามารถในการทำงานร่วมกับผู้อื่นอย่างมีประสิทธิภาพ',
              engDescription: 'Ability to work effectively with others',
              domain: 'คุณลักษณะบุคคล',
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'การสื่อสาร',
              engName: 'Communication',
              thaiDescription: 'ความสามารถในการสื่อสารและนำเสนออย่างชัดเจน',
              engDescription: 'Ability to communicate and present clearly',
              domain: 'คุณลักษณะบุคคล',
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'ภาวะผู้นำ',
              engName: 'Leadership',
              thaiDescription: 'ความสามารถในการเป็นผู้นำและจัดการทีม',
              engDescription: 'Ability to lead and manage teams',
              domain: 'คุณลักษณะบุคคล',
              curriculumId: curriculum.id,
            },
            // จริยธรรม domain
            {
              thaiName: 'จริยธรรมทางเทคโนโลยี',
              engName: 'Technology Ethics',
              thaiDescription: 'การมีจริยธรรมในการใช้และพัฒนาเทคโนโลยี',
              engDescription: 'Ethics in using and developing technology',
              domain: 'จริยธรรม',
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'ความรับผิดชอบ',
              engName: 'Responsibility',
              thaiDescription: 'ความรับผิดชอบต่อสังคมและสิ่งแวดล้อม',
              engDescription: 'Responsibility towards society and environment',
              domain: 'จริยธรรม',
              curriculumId: curriculum.id,
            },
          ];

          // Create root skills
          for (const skillData of rootSkillsData) {
            const skill = await tx.skill.create({ data: skillData });
            skills.push(skill);
          }

          // Level 2 skills (sub-skills)
          const level2SkillsData = [
            // Programming Knowledge sub-skills
            {
              thaiName: 'ภาษา Java',
              engName: 'Java Programming',
              thaiDescription: 'ความรู้เกี่ยวกับการเขียนโปรแกรมด้วยภาษา Java',
              engDescription: 'Knowledge of Java programming language',
              domain: 'ความรู้',
              parentId: skills.find(
                (s) => s.engName === 'Programming Knowledge',
              )?.id,
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'ภาษา Python',
              engName: 'Python Programming',
              thaiDescription: 'ความรู้เกี่ยวกับการเขียนโปรแกรมด้วยภาษา Python',
              engDescription: 'Knowledge of Python programming language',
              domain: 'ความรู้',
              parentId: skills.find(
                (s) => s.engName === 'Programming Knowledge',
              )?.id,
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'การพัฒนาเว็บ',
              engName: 'Web Development',
              thaiDescription: 'ความรู้เกี่ยวกับการพัฒนาเว็บแอปพลิเคชัน',
              engDescription: 'Knowledge of web application development',
              domain: 'ความรู้',
              parentId: skills.find(
                (s) => s.engName === 'Programming Knowledge',
              )?.id,
              curriculumId: curriculum.id,
            },
            // Database Knowledge sub-skills
            {
              thaiName: 'SQL',
              engName: 'SQL Database',
              thaiDescription: 'ความรู้เกี่ยวกับการใช้ภาษา SQL',
              engDescription: 'Knowledge of SQL language',
              domain: 'ความรู้',
              parentId: skills.find((s) => s.engName === 'Database Knowledge')
                ?.id,
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'NoSQL',
              engName: 'NoSQL Database',
              thaiDescription: 'ความรู้เกี่ยวกับฐานข้อมูล NoSQL',
              engDescription: 'Knowledge of NoSQL databases',
              domain: 'ความรู้',
              parentId: skills.find((s) => s.engName === 'Database Knowledge')
                ?.id,
              curriculumId: curriculum.id,
            },
            // Programming Skills sub-skills
            {
              thaiName: 'การเขียนโค้ดที่มีคุณภาพ',
              engName: 'Quality Code Writing',
              thaiDescription: 'ทักษะในการเขียนโค้ดที่สะอาดและมีคุณภาพ',
              engDescription: 'Skills in writing clean and quality code',
              domain: 'ทักษะ',
              parentId: skills.find((s) => s.engName === 'Programming Skills')
                ?.id,
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'การทดสอบซอฟต์แวร์',
              engName: 'Software Testing',
              thaiDescription: 'ทักษะในการทดสอบและตรวจสอบซอฟต์แวร์',
              engDescription: 'Skills in software testing and verification',
              domain: 'ทักษะ',
              parentId: skills.find((s) => s.engName === 'Programming Skills')
                ?.id,
              curriculumId: curriculum.id,
            },
            // Problem Solving Skills sub-skills
            {
              thaiName: 'การวิเคราะห์อัลกอริทึม',
              engName: 'Algorithm Analysis',
              thaiDescription: 'ทักษะในการวิเคราะห์และออกแบบอัลกอริทึม',
              engDescription: 'Skills in algorithm analysis and design',
              domain: 'ทักษะ',
              parentId: skills.find(
                (s) => s.engName === 'Problem Solving Skills',
              )?.id,
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'การแก้ไขข้อผิดพลาด',
              engName: 'Debugging',
              thaiDescription: 'ทักษะในการค้นหาและแก้ไขข้อผิดพลาดในโปรแกรม',
              engDescription: 'Skills in finding and fixing program errors',
              domain: 'ทักษะ',
              parentId: skills.find(
                (s) => s.engName === 'Problem Solving Skills',
              )?.id,
              curriculumId: curriculum.id,
            },
            // Communication sub-skills
            {
              thaiName: 'การนำเสนอ',
              engName: 'Presentation Skills',
              thaiDescription: 'ทักษะในการนำเสนอผลงานและแนวคิด',
              engDescription: 'Skills in presenting work and ideas',
              domain: 'คุณลักษณะบุคคล',
              parentId: skills.find((s) => s.engName === 'Communication')?.id,
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'การเขียนเอกสาร',
              engName: 'Documentation Writing',
              thaiDescription: 'ทักษะในการเขียนเอกสารทางเทคนิค',
              engDescription: 'Skills in technical documentation writing',
              domain: 'คุณลักษณะบุคคล',
              parentId: skills.find((s) => s.engName === 'Communication')?.id,
              curriculumId: curriculum.id,
            },
          ];

          // Create level 2 skills
          for (const skillData of level2SkillsData) {
            const skill = await tx.skill.create({ data: skillData });
            skills.push(skill);
          }

          // Level 3 skills (specific skills)
          const level3SkillsData = [
            // Java sub-skills
            {
              thaiName: 'Spring Framework',
              engName: 'Spring Framework',
              thaiDescription: 'ความรู้เกี่ยวกับ Spring Framework สำหรับ Java',
              engDescription: 'Knowledge of Spring Framework for Java',
              domain: 'ความรู้',
              parentId: skills.find((s) => s.engName === 'Java Programming')
                ?.id,
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'JPA/Hibernate',
              engName: 'JPA/Hibernate',
              thaiDescription: 'ความรู้เกี่ยวกับ JPA และ Hibernate ORM',
              engDescription: 'Knowledge of JPA and Hibernate ORM',
              domain: 'ความรู้',
              parentId: skills.find((s) => s.engName === 'Java Programming')
                ?.id,
              curriculumId: curriculum.id,
            },
            // Python sub-skills
            {
              thaiName: 'Django Framework',
              engName: 'Django Framework',
              thaiDescription:
                'ความรู้เกี่ยวกับ Django Framework สำหรับ Python',
              engDescription: 'Knowledge of Django Framework for Python',
              domain: 'ความรู้',
              parentId: skills.find((s) => s.engName === 'Python Programming')
                ?.id,
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'Data Science Libraries',
              engName: 'Data Science Libraries',
              thaiDescription: 'ความรู้เกี่ยวกับไลบรารีสำหรับ Data Science',
              engDescription: 'Knowledge of Data Science libraries',
              domain: 'ความรู้',
              parentId: skills.find((s) => s.engName === 'Python Programming')
                ?.id,
              curriculumId: curriculum.id,
            },
            // Web Development sub-skills
            {
              thaiName: 'React.js',
              engName: 'React.js',
              thaiDescription: 'ความรู้เกี่ยวกับ React.js Framework',
              engDescription: 'Knowledge of React.js Framework',
              domain: 'ความรู้',
              parentId: skills.find((s) => s.engName === 'Web Development')?.id,
              curriculumId: curriculum.id,
            },
            {
              thaiName: 'Node.js',
              engName: 'Node.js',
              thaiDescription: 'ความรู้เกี่ยวกับ Node.js Runtime',
              engDescription: 'Knowledge of Node.js Runtime',
              domain: 'ความรู้',
              parentId: skills.find((s) => s.engName === 'Web Development')?.id,
              curriculumId: curriculum.id,
            },
          ];

          // Create level 3 skills
          for (const skillData of level3SkillsData) {
            const skill = await tx.skill.create({ data: skillData });
            skills.push(skill);
          }

          // 6. Generate subjects/courses
          const subjectData = [
            {
              code: 'CS101',
              curriculumId: curriculum.id,
              thaiName: 'การเขียนโปรแกรมเบื้องต้น',
              engName: 'Introduction to Programming',
              credit: '3(2-2-5)',
              type: 'บังคับ',
              thaiDescription: 'หลักการเขียนโปรแกรมพื้นฐานและการแก้ปัญหา',
              engDescription:
                'Basic programming principles and problem solving',
            },
            {
              code: 'CS201',
              curriculumId: curriculum.id,
              thaiName: 'โครงสร้างข้อมูลและอัลกอริทึม',
              engName: 'Data Structures and Algorithms',
              credit: '3(3-0-6)',
              type: 'บังคับ',
              thaiDescription: 'โครงสร้างข้อมูลและการวิเคราะห์อัลกอริทึม',
              engDescription: 'Data structures and algorithm analysis',
            },
            {
              code: 'CS301',
              curriculumId: curriculum.id,
              thaiName: 'ฐานข้อมูล',
              engName: 'Database Systems',
              credit: '3(2-2-5)',
              type: 'บังคับ',
              thaiDescription: 'การออกแบบและจัดการระบบฐานข้อมูล',
              engDescription: 'Database system design and management',
            },
            {
              code: 'CS401',
              curriculumId: curriculum.id,
              thaiName: 'วิศวกรรมซอฟต์แวร์',
              engName: 'Software Engineering',
              credit: '3(2-2-5)',
              type: 'บังคับ',
              thaiDescription: 'หลักการและกระบวนการพัฒนาซอฟต์แวร์',
              engDescription: 'Software development principles and processes',
            },
            {
              code: 'CS501',
              curriculumId: curriculum.id,
              thaiName: 'โครงงานวิทยาการคอมพิวเตอร์',
              engName: 'Computer Science Project',
              credit: '3(0-6-3)',
              type: 'บังคับ',
              thaiDescription: 'โครงงานด้านวิทยาการคอมพิวเตอร์',
              engDescription: 'Computer science capstone project',
            },
          ];

          const subjects = [];
          for (const subjectInfo of subjectData) {
            const subject = await tx.subject.create({ data: subjectInfo });
            subjects.push(subject);
          }

          // 7. Generate courses for current year
          const courses = [];
          for (const subject of subjects) {
            const course = await tx.course.create({
              data: {
                subjectId: subject.id,
                semester: 1,
                year: 2024,
                active: true,
              },
            });
            courses.push(course);
          }

          // 8. Generate CLOs (Course Learning Outcomes)
          const clos = [];
          for (let i = 0; i < subjects.length; i++) {
            const subject = subjects[i];
            const relevantSkills = skills
              .filter(
                (skill) =>
                  skill.parentId !== null && // Only level 2 and 3 skills
                  Math.random() > 0.7, // Random selection
              )
              .slice(0, 3); // Max 3 skills per subject

            for (let j = 0; j < 3; j++) {
              const skill = relevantSkills[j % relevantSkills.length];
              const clo = await tx.clo.create({
                data: {
                  name: `CLO${j + 1}`,
                  subjectId: subject.id,
                  ploId: plos[j % plos.length].id,
                  skillId: skill?.id,
                  thaiDescription: `ผลการเรียนรู้ที่ ${j + 1} ของวิชา ${subject.thaiName}`,
                  engDescription: `Learning outcome ${j + 1} for ${subject.engName}`,
                  expectSkillLevel: Math.floor(Math.random() * 3) + 1, // 1-3
                },
              });
              clos.push(clo);
            }
          }

          // 9. Generate skill collections (link students to skills) - Optimized bulk creation
          const skillCollectionsData = [];
          for (const student of students) {
            // Select random skills for each student (8-12 skills to reduce data volume)
            const studentSkillCount = Math.floor(Math.random() * 5) + 8; // 8-12
            const selectedClos = clos
              .sort(() => 0.5 - Math.random())
              .slice(0, studentSkillCount);

            for (const clo of selectedClos) {
              const course = courses.find(
                (c) =>
                  subjects.find((s) => s.id === c.subjectId)?.id ===
                  clo.subjectId,
              );

              if (course) {
                const gainedLevel = Math.floor(Math.random() * 4) + 1; // 1-4
                const passed = gainedLevel >= (clo.expectSkillLevel || 1);

                skillCollectionsData.push({
                  studentId: student.id,
                  courseId: course.id,
                  cloId: clo.id,
                  gainedLevel,
                  passed,
                });
              }
            }
          }

          // Bulk create skill collections
          await tx.skill_collection.createMany({
            data: skillCollectionsData,
          });
          const skillCollections = skillCollectionsData; // Use the data array for count

          return {
            message: 'Test data generation completed successfully',
            data: {
              curriculum: {
                id: curriculum.id,
                code: curriculum.code,
                thaiName: curriculum.thaiName,
                engName: curriculum.engName,
              },
              summary: {
                coordinatorsCount: coordinators.length,
                studentsCount: students.length,
                plosCount: plos.length,
                skillsCount: skills.length,
                subjectsCount: subjects.length,
                coursesCount: courses.length,
                closCount: clos.length,
                skillCollectionsCount: skillCollections.length,
              },
              skillHierarchy: {
                rootSkills: skills.filter((s) => s.parentId === null).length,
                level2Skills: skills.filter(
                  (s) =>
                    s.parentId !== null &&
                    skills.some(
                      (parent) =>
                        parent.id === s.parentId && parent.parentId === null,
                    ),
                ).length,
                level3Skills: skills.filter(
                  (s) =>
                    s.parentId !== null &&
                    skills.some(
                      (parent) =>
                        parent.id === s.parentId && parent.parentId !== null,
                    ),
                ).length,
              },
            },
          };
        },
        {
          timeout: 60000, // 60 seconds timeout
        },
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate test data: ${error.message}`,
      );
    }
  }

  generateTestSkillCollections() {}
  // service
  async getSkillCollectionSummaryByCoursePaginated(
    courseId: number,
    pag: SkillCollectionByCourseFilterDto,
  ) {
    const defaultLimit = 10;
    const defaultPage = 1;

    const { studentName, studentCode, page, limit, sort, orderBy } = pag;
    const _limit = Number(limit ?? defaultLimit);
    const _page = Number(page ?? defaultPage);
    const _skip = (_page - 1) * _limit;

    const codePrefix = studentCode ? studentCode.slice(0, 2) : undefined;

    const studentWhere: Prisma.studentWhereInput = {
      thaiName: studentName ? { contains: studentName } : undefined,
      code: codePrefix ? { startsWith: codePrefix } : undefined,
      skill_collections: { some: { courseId } }, // join กับ course
    };

    // ดึง student + total
    const { students, total } = await this.prisma.$transaction(async (tx) => {
      const students = await tx.student.findMany({
        where: studentWhere,
        select: { id: true, code: true, thaiName: true },
        orderBy: { [sort || 'code']: (orderBy as any) ?? 'asc' },
        skip: _skip,
        take: _limit,
      });

      const total = await tx.student.count({ where: studentWhere });
      return { students, total };
    });

    if (!students.length) {
      return createPaginatedData([], 0, _page, _limit);
    }

    const studentIds = students.map((s) => s.id);

    // join skill_collection + skill
    const scRows = await this.prisma.skill_collection.findMany({
      where: { courseId, studentId: { in: studentIds } },
      select: {
        studentId: true,
        gainedLevel: true,
        clo: {
          select: {
            skillId: true,
            skill: { select: { id: true, thaiName: true } },
          },
        },
      },
    });

    const byStudent = new Map<number, Map<number, number[]>>();
    const skillNameMap = new Map<number, string>();

    for (const r of scRows) {
      const sid = r.studentId;
      const skId = r.clo?.skillId ?? null;
      const skName = r.clo?.skill?.thaiName ?? '';
      if (!sid || !skId) continue;

      if (!byStudent.has(sid)) byStudent.set(sid, new Map());
      const m = byStudent.get(sid)!;
      if (!m.has(skId)) m.set(skId, []);
      m.get(skId)!.push(r.gainedLevel);

      if (skName && !skillNameMap.has(skId)) skillNameMap.set(skId, skName);
    }

    /** helpers (ไม่มี any) */
    const mode = (arr: number[]): number | null => {
      if (!arr.length) return null;
      const freq: Record<number, number> = {};
      for (const v of arr) freq[v] = (freq[v] || 0) + 1;
      let ans = arr[0],
        mx = 0;
      for (const [k, v] of Object.entries(freq)) {
        if (v > mx) {
          mx = v;
          ans = Number(k);
        }
      }
      return ans;
    };
    const avg = (arr: number[]): number | null =>
      arr.length
        ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2))
        : null;
    const min = (arr: number[]): number | null =>
      arr.length ? Math.min(...arr) : null;
    const max = (arr: number[]): number | null =>
      arr.length ? Math.max(...arr) : null;

    /** ✅ ไม่แยกโดเมน: ใส่ skills เป็นก้อนเดียว + summary รวม */
    const data = students.map((stu) => {
      const m = byStudent.get(stu.id);
      const skills: {
        skillId: number;
        skillName: string;
        gainedLevel: number | null;
      }[] = [];
      const allLevels: number[] = [];

      if (m) {
        for (const [skId, levels] of m.entries()) {
          const picked = mode(levels);
          if (levels.length) allLevels.push(...levels);
          skills.push({
            skillId: skId,
            skillName: skillNameMap.get(skId) ?? '',
            gainedLevel: picked,
          });
        }
      }

      return {
        studentId: stu.id,
        studentName: stu.thaiName,
        studentCode: stu.code,
        // ไม่แยก hard/soft แล้ว
        skills,
        // รวมภาพรวมทั้งคอร์สของนิสิตคนนั้น (จะเก็บ/ไม่เก็บก็ได้)
        summary: {
          mode: mode(allLevels),
          avg: avg(allLevels),
          min: min(allLevels),
          max: max(allLevels),
          count: allLevels.length,
        },
      };
    });

    return createPaginatedData(data, total, _page, _limit);
  }
}
