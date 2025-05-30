import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClosService } from '../clos/clos.service';
import { SkillCollection } from 'src/generated/nestjs-dto/skillCollection.entity';
import { StudentScoreList } from 'src/dto/filters/filter.base.dto';
import { SkillCollectionDto } from 'src/generated/nestjs-dto/skillCollection.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SkillCollectionsService {
  constructor(
    private prisma: PrismaService,
    private cloService: ClosService,
  ) {}

  async getSkillCollectionsByStudentId(studentCode: string) {
    const student = await this.prisma.student.findUnique({
      where: { code: studentCode },
      include: {
        skill_collections: {
          include: {
            clo: true,
          },
        },
      },
    });

    // If no student is found, return empty result or throw an error
    if (!student) {
      return { specific: [], soft: [] }; // Or throw new Error('Student not found');
    }

    if (!student.skill_collections) {
      return { specific: [], soft: [] }; // Or throw new Error('student has no skill collections');
    }

    const skillCollections = await this.prisma.skill_collection.findMany({
      where: { studentId: student.id },
      select: {
        id: true,
        gainedLevel: true,
        passed: true,
        clo: {
          select: {
            id: true,
            name: true,
            expectSkillLevel: true,
            skill: {
              select: {
                id: true,
                thaiName: true,
                engName: true,
                domain: true,
                parent: {
                  select: {
                    id: true,
                    thaiName: true,
                    engName: true,
                    domain: true,
                    parent: {
                      select: {
                        id: true,
                        thaiName: true,
                        engName: true,
                        domain: true,
                        parent: {
                          select: {
                            id: true,
                            thaiName: true,
                            engName: true,
                            domain: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // สร้าง skillLevelMap เพื่อเก็บ gainedLevel ที่ดีที่สุดต่อ skillId
    const skillLevelMap = new Map<number, number>();
    skillCollections.forEach((sc) => {
      const skill = sc.clo?.skill;
      if (!skill) return;
      const current = skillLevelMap.get(skill.id) || 0;
      skillLevelMap.set(skill.id, Math.max(current, sc.gainedLevel));
    });

    // ดึงเฉพาะ skill ที่มีใน skillCollections
    const skillIds = new Set<number>();

    skillCollections.forEach((sc) => {
      let skill = sc.clo?.skill;
      while (skill) {
        skillIds.add(skill.id);
        skill = skill.parent;
      }
    });

    const relatedSkills = await this.prisma.skill.findMany({
      where: { id: { in: Array.from(skillIds) } },
      include: { parent: true },
    });

    // แปลง skill hierarchy เป็น tree (ใช้ข้อมูล parent)
    const skillMap = new Map<number, any>();
    for (const skill of relatedSkills) {
      skillMap.set(skill.id, {
        id: skill.id,
        name: skill.engName,
        domain: skill.domain,
        parentId: skill.parent?.id || null,
        gained: skillLevelMap.get(skill.id),
        subskills: [],
      });
    }

    // ต่อโครงสร้าง parent → children
    for (const node of skillMap.values()) {
      if (node.parentId) {
        const parent = skillMap.get(node.parentId);
        if (parent) parent.subskills.push(node);
      }
    }

    // เติม gained แบบ mode (recursive)
    function calculateMode(arr: number[]): number {
      const count = new Map<number, number>();
      arr.forEach((n) => count.set(n, (count.get(n) || 0) + 1));
      const max = Math.max(...count.values());
      const modes = [...count.entries()]
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, c]) => c === max)
        .map(([n]) => n);
      return Math.max(...modes);
    }

    function fillGained(node: any): number | undefined {
      if (!node.subskills.length) return node.gained;
      const childGained = node.subskills
        .map(fillGained)
        .filter((x) => x !== undefined) as number[];
      if (childGained.length > 0) node.gained = calculateMode(childGained);
      return node.gained;
    }

    const roots = [...skillMap.values()].filter((n) => n.parentId === null);
    roots.forEach(fillGained);

    //  แยก specific กับ soft และ return
    const specific = roots.filter(
      (r) => r.domain === 'ทักษะ' || r.domain === 'ความรู้',
    );
    const soft = roots.filter(
      (r) => r.domain === 'คุณลักษณะบุคคล' || r.domain === 'จริยธรรม',
    );

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
  ): Promise<SkillCollection[]> {
    console.log('Import Path 2', courseId, cloId, studentScoreList);
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const clo = await this.cloService.findOne(cloId);

    const skillCollections = [];

    if (!course.subjectId) {
      throw new BadRequestException(
        'Course must have a subject before importing skill collections',
      );
    }

    if (!clo) {
      throw new NotFoundException(`CLO with ID ${cloId} not found`);
    }

    for (const studentScore of studentScoreList) {
      let student = await this.prisma.student.findUnique({
        where: { code: studentScore.studentCode },
      });
      if (!student) {
        // create student with code
        const newStudent = await this.prisma.student.create({
          data: {
            code: studentScore.studentCode,
          },
        });
        student = newStudent;
      }
      // check if student has skill collection of this course and clo
      let skillCollection = await this.prisma.skill_collection.findFirst({
        where: {
          studentId: student.id,
          courseId: course.id,
          cloId: clo.id,
        },
      });
      if (skillCollection) {
        // update skill collection
        skillCollection = await this.prisma.skill_collection.update({
          where: {
            id: skillCollection.id,
          },
          data: {
            gainedLevel: studentScore.gainedLevel,
            // check if score more than clo expect skill level
            passed:
              studentScore.gainedLevel >= clo.expectSkillLevel ? true : false,
          },
        });
      } else {
        // create skill collection for student
        skillCollection = await this.prisma.skill_collection.create({
          data: {
            studentId: student.id, // FK เชื่อมกับ student
            courseId: course.id, // FK เชื่อมกับ course
            cloId: clo.id, // FK เชื่อมกับ clo
            gainedLevel: studentScore.gainedLevel, // ค่าที่ได้จาก studentScore
            // check if score more than clo expect skill level
            passed:
              studentScore.gainedLevel >= clo.expectSkillLevel ? true : false,
          },
        });
      }

      skillCollections.push(skillCollection);
    }
    return skillCollections;
  }

  // async searchSkillCollection(
  //   skillName: string,
  //   curriculumId: number,
  // ): Promise<any[]> {
  //   return this.prisma.skill_collection.findMany({
  //     where: {
  //       clo: {
  //         skill: {
  //           // engName or thaiName
  //           OR: [
  //             { engName: { contains: skillName } },
  //             { thaiName: { contains: skillName } },
  //           ],
  //         },
  //       },
  //     },
  //   });
  // }

  /**
   * Generate comprehensive test data for curriculum with branchId = 2
   * Creates curriculum, coordinators, 100 students, PLOs, 3-level skills hierarchy,
   * subjects, CLOs, and skill collections
   */
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
                instructorId: coordinator.id,
                curriculumId: curriculum.id,
              },
            });
          }

          // 3. Generate 100 students
          const thaiFirstNames = [
            'สมชาย',
            'สุดา',
            'วิชัย',
            'นิรันดร์',
            'ปรีชา',
            'สุภาพ',
            'วิไล',
            'มาลี',
            'สมศรี',
            'ประยุทธ์',
            'อนุชา',
            'สุรชัย',
            'วิทยา',
            'ชัยวัฒน์',
            'สมพงษ์',
            'นิตยา',
            'สุมาลี',
            'วิมล',
            'ชนิดา',
            'สุกัญญา',
            'ธนาคาร',
            'ปิยะ',
            'สุรศักดิ์',
            'วีระ',
            'ชาติชาย',
            'สุนีย์',
            'วรรณา',
            'ชลิดา',
            'สุภัทรา',
            'วิภาวี',
          ];

          const thaiLastNames = [
            'วิทยาการ',
            'เทคโนโลยี',
            'คอมพิวเตอร์',
            'สารสนเทศ',
            'วิศวกรรม',
            'วิทยาศาสตร์',
            'คณิตศาสตร์',
            'ฟิสิกส์',
            'เคมี',
            'ชีววิทยา',
            'ธุรกิจ',
            'การจัดการ',
            'เศรษฐศาสตร์',
            'การเงิน',
            'การตลาด',
            'ภาษาไทย',
            'ภาษาอังกฤษ',
            'ประวัติศาสตร์',
            'ภูมิศาสตร์',
            'รัฐศาสตร์',
            'สังคมศาสตร์',
            'จิตวิทยา',
            'ปรัชญา',
            'ศิลปกรรม',
            'ดนตรี',
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
            const studentCode = `67130500${i.toString().padStart(3, '0')}`;
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
              enrollmentDate: new Date('2024-06-01'),
              socials: {
                facebook: `${engFirstName.toLowerCase()}.${engLastName.toLowerCase()}`,
                email: `${studentCode}@student.university.ac.th`,
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
                startsWith: '67130500',
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
}
