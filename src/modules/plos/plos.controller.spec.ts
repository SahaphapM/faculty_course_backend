import { Test, TestingModule } from '@nestjs/testing';
import { PlosController } from './plos.controller';
import { PloService } from './plos.service';

describe('PlosController', () => {
  let controller: PlosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlosController],
      providers: [PloService],
    }).compile();

    controller = module.get<PlosController>(PlosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
