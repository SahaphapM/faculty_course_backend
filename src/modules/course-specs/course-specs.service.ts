import { Injectable } from '@nestjs/common';
import { CreateCourseSpecDto } from 'src/dto/course-specs/create-course-spec.dto';
import { UpdateCourseSpecDto } from 'src/dto/course-specs/update-course-spec.dto';

@Injectable()
export class CourseSpecsService {
  create(createCourseSpecDto: CreateCourseSpecDto) {
    return 'This action adds a new courseSpec';
  }

  findAll() {
    return `This action returns all courseSpecs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseSpec`;
  }

  update(id: number, updateCourseSpecDto: UpdateCourseSpecDto) {
    return `This action updates a #${id} courseSpec`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseSpec`;
  }
}
