import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from '../../dto/student/create-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { Brackets, In, Repository } from 'typeorm';
import { SkillCollectionTree } from '../../entities/skill-collection.entity';
import { PaginationDto } from 'src/dto/pagination.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  // Create a new student
  async create(studentDto: CreateStudentDto): Promise<Student> {
    const newStudent = this.studentRepository.create(studentDto);
    return await this.studentRepository.save(newStudent);
  }

  async importStudents(students: CreateStudentDto[]) {
    if (Array.isArray(students)) {
      const newStudents = students.map((student) =>
        this.studentRepository.create({
          ...student,
          enrollmentDate: new Date(student.enrollmentDate),
        }),
      );
      await this.studentRepository.insert(newStudents);
    } else {
      // Handle the case where `students` is not an array
      console.error('Expected students to be an array, but got:', students);
    }
  }

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Student[]; total: number }> {
    const { page, limit, sort, order, search, columnId, columnName } =
      paginationDto;

    const queryBuilder = this.studentRepository.createQueryBuilder('student');

    // Join relations to include courseDetails, courses, and subjects
    queryBuilder
      .leftJoinAndSelect('student.skillCollection', 'skillCollection')
      .leftJoinAndSelect(
        'skillCollection.skillExpectedLevels',
        'skillExpectedLevels',
      )
      .leftJoinAndSelect('skillExpectedLevels.skill', 'skill')
      .innerJoin('student.courseDetails', 'courseDetails')
      .leftJoin('courseDetails.course', 'course')
      .leftJoin('course.subject', 'subject');

    // Conditionally filter based on columnId and columnName
    if (columnId) {
      if (columnName === 'subject') {
        // Filter students by subject id
        queryBuilder.andWhere('subject.id = :subjectId', {
          subjectId: columnId,
        });
      } else if (columnName === 'course') {
        // Filter students by course id
        queryBuilder.andWhere('course.id = :courseId', { courseId: columnId });
      }
    }

    // Add search conditions if provided
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('student.name LIKE :search', { search: `%${search}%` })
            .orWhere('student.nameInEnglish LIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('student.id LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    // Add sorting if provided
    if (sort && order) {
      queryBuilder.orderBy(`student.${sort}`, order);
    }

    // Log the generated SQL query and its parameters
    // console.log('Generated SQL:', queryBuilder.getSql());
    // console.log('Query Parameters:', queryBuilder.getParameters());

    // Execute the query with pagination
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  // Get all students
  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({
      relations: {
        skillCollection: true,
      },
    });
  }

  async findManyByIds(studentListId: string[]) {
    return await this.studentRepository.find({
      where: { id: In(studentListId) },
    });
  }

  // Get a student by ID
  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: {
        courseEnrollment: { course: true },
        skillCollection: true,
      },
      // relationLoadStrategy: 'query',
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }

    // student.skillCollectionTree = this.buildSkillCollectionTree(
    //   student.skillCollection,
    // );
    // delete student.skillCollection;

    return student;
  }

  // Update a student by ID
  async update(id: string, studentDto: CreateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, studentDto);
    return await this.studentRepository.save(student);
  }

  // Delete a student by ID
  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async buildSkillCollectionTree(id: string): Promise<SkillCollectionTree[]> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: {
        courseEnrollment: {
          skillCollections: {
            skillExpectedLevels: {
              skill: {
                parent: true,
              },
            },
          },
        },
      },
    });

    let idCounter = 1; // Initialize a counter for auto-incremented IDs
    const result: SkillCollectionTree[] = [];

    for (let i = 0; i < student.courseEnrollment.length; i++) {
      if (!student.courseEnrollment[i].skillCollections) {
        throw new NotFoundException(`SkillCollections" not found`);
      }
      const skillCollections = student.courseEnrollment[i].skillCollections;

      const skillMap: { [skillId: number]: SkillCollectionTree } = {};

      // Initialize SkillCollectionTree nodes and populate the skillMap
      skillCollections.forEach((skillCollection) => {
        const { gainedLevel, passed, skillExpectedLevels } = skillCollection;
        const { id: skillId, name } = skillExpectedLevels.skill;

        skillMap[skillId] = {
          id: idCounter++, // Assign and increment the auto-increment ID
          skillId,
          name,
          gainedLevel,
          expectedLevel: skillExpectedLevels.expectedLevel,
          passed,
          children: [],
        };
      });

      // Build the tree structure, adding missing parents if necessary
      skillCollections.forEach((skillCollection) => {
        const { skillExpectedLevels } = skillCollection;
        const { skill } = skillExpectedLevels;
        const { id: skillId, parent } = skill;

        if (parent) {
          const parentId = parent.id;

          // If the parent isn't in skillMap, add a placeholder for it
          if (!skillMap[parentId]) {
            skillMap[parentId] = {
              id: idCounter++, // Assign and increment the auto-increment ID
              skillId: parentId,
              name: parent.name,
              gainedLevel: null,
              expectedLevel: null,
              passed: null,
              children: [],
            };
            result.push(skillMap[parentId]);
          }

          // Add current skill as a child of its parent
          skillMap[parentId].children.push(skillMap[skillId]);
          console.log(skillMap);
        } else {
          // If no parent, it's a root skill
          result.push(skillMap[skillId]);
        }
      });
    }
    return result;
  }
}
