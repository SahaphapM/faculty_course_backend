import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from '../../dto/student/create-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../../entities/student.entity';
import { Brackets, In, Repository } from 'typeorm';
import {
  SkillCollection,
  SkillCollectionTree,
} from '../../entities/skill-collection.entity';
import { Skill } from 'src/entities/skill.entity';
import { PaginationDto } from 'src/dto/pagination.dto';

@Injectable()
export class StudentsService {


  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) { }

  // Create a new student
  async create(studentDto: CreateStudentDto): Promise<Student> {
    const newStudent = this.studentRepository.create(studentDto);
    return await this.studentRepository.save(newStudent);
  }

  async importStudents(students: CreateStudentDto[]) {
    if (Array.isArray(students)) {
      const newStudents = students.map((student) =>
        this.studentRepository.create({ ...student, enrollmentDate: new Date(student.enrollmentDate) }),
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
        skillCollection: true,
      },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }

    student.skillCollectionTree = this.buildSkillCollectionTree(
      student.skillCollection,
    );
    delete student.skillCollection;

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

  private buildSkillCollectionTree(
    skillCollections: SkillCollection[],
  ): SkillCollectionTree[] {
    // get distinct skill parent
    const distinctParentSkills: Skill[] = [];

    for (let index = 0; index < skillCollections.length; index++) {
      if (skillCollections[index].skillExpectedLevels.skill.parent) {
        if (
          !distinctParentSkills.some(
            (parentSkill) =>
              parentSkill.id ===
              skillCollections[index].skillExpectedLevels.skill.parent.id,
          )
        ) {
          distinctParentSkills.push(
            skillCollections[index].skillExpectedLevels.skill.parent,
          );
        }
      }
    }

    const skillCollectionMapParent: SkillCollectionTree[] = [];

    distinctParentSkills.forEach((parentSkill) => {
      if (parentSkill) {
        const skillCollectionTree = new SkillCollectionTree();
        skillCollectionTree.id = parentSkill.id;
        skillCollectionTree.name = parentSkill.name;
        skillCollectionTree.gainedLevel = null;
        skillCollectionTree.expectedLevel = null;
        skillCollectionTree.passed = null;
        skillCollectionMapParent.push(skillCollectionTree);
      }
    });

    //////////////////////////////////////////////////////////////// Passs //////////////////////////////////////////////////////////////////

    for (let index = 0; index < skillCollectionMapParent.length; index++) {
      // find children skillCollection by parent skill id
      const childrenSkillCollections = skillCollections.filter(
        (skillCollection) =>
          skillCollection.skillExpectedLevels.skill.parent &&
          skillCollection.skillExpectedLevels.skill.parent.id ===
          skillCollectionMapParent[index].id,
      );

      if (childrenSkillCollections) {
        for (let index = 0; index < childrenSkillCollections.length; index++) {
          const skillCollectionTree = new SkillCollectionTree();
          skillCollectionTree.id =
            childrenSkillCollections[index].skillExpectedLevels.id;
          skillCollectionTree.name =
            childrenSkillCollections[index].skillExpectedLevels.skill.name;
          skillCollectionTree.gainedLevel =
            childrenSkillCollections[index].gainedLevel;
          skillCollectionTree.expectedLevel =
            childrenSkillCollections[index].skillExpectedLevels.expectedLevel;
          skillCollectionTree.passed = childrenSkillCollections[index].passed;
          skillCollectionMapParent[index].children =
            skillCollectionMapParent[index].children || [];
          skillCollectionMapParent[index].children.push(skillCollectionTree);
        }
      }
    }

    for (let index = 0; index < skillCollectionMapParent.length; index++) {
      // if skillCollection is in skillCollectionMapParent
      const chilSkillInParentMap = skillCollections.find(
        (skillCollection) =>
          skillCollection.skillExpectedLevels.skill.id ===
          skillCollectionMapParent[index].id,
      );
      if (chilSkillInParentMap) {
        const parentSkillIndex = skillCollectionMapParent.findIndex(
          (skill) =>
            chilSkillInParentMap.skillExpectedLevels.skill.parent &&
            skill.id ===
            chilSkillInParentMap.skillExpectedLevels.skill.parent.id,
        );
        if (parentSkillIndex > -1) {
          skillCollectionMapParent[parentSkillIndex].children.push(
            skillCollectionMapParent[index],
          );
          // remove parent skill
          skillCollectionMapParent.splice(index, 1);
        }
      }
    }
    ////////////////////////////////// if skillCollection is not have children and parent //////////////////////////////////
    //// i will be back to write this function

    return skillCollectionMapParent;
  }
}
