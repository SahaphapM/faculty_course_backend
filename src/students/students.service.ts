import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Brackets, Repository } from 'typeorm';
import { PaginationDto } from 'src/users/dto/pagination.dto';

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

  async findAllByPage(
    paginationDto: PaginationDto,
  ): Promise<{ data: Student[]; total: number }> {
    const { page, limit, sort, order, search, columnId, columnName } =
      paginationDto;

    const queryBuilder = this.studentRepository.createQueryBuilder('student');

    // Join relations to include courseDetails, courses, and subjects
    queryBuilder
      .leftJoinAndSelect('student.skillCollection', 'skillCollection')
      .leftJoinAndSelect('skillCollection.skillDetail', 'skillDetail')
      .leftJoinAndSelect('skillDetail.skill', 'skill')
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
        skillCollection: { skillDetail: { skill: true } },
      },
    });
  }

  // Get a student by ID
  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: { skillCollection: { skillDetail: { skill: true } } },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${id}" not found`);
    }
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
}
