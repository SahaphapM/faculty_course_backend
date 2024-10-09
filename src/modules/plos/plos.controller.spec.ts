import { Test, TestingModule } from '@nestjs/testing';
import { PlosController } from './plos.controller';
import { PlosService } from './plos.service';

describe('PlosController', () => {
  let controller: PlosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlosController],
      providers: [PlosService],
    }).compile();

    controller = module.get<PlosController>(PlosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
