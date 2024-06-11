import { Injectable } from '@nestjs/common';
import { CreateCloDto } from './dto/create-clo.dto';
import { UpdateCloDto } from './dto/update-clo.dto';

@Injectable()
export class ClosService {
  create(createCloDto: CreateCloDto) {
    return 'This action adds a new clo';
  }

  findAll() {
    return `This action returns all clos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clo`;
  }

  update(id: number, updateCloDto: UpdateCloDto) {
    return `This action updates a #${id} clo`;
  }

  remove(id: number) {
    return `This action removes a #${id} clo`;
  }
}
