import { Test, TestingModule } from '@nestjs/testing';
import { PlosService } from './plos.service';

describe('PlosService', () => {
  let service: PlosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlosService],
    }).compile();

    service = module.get<PlosService>(PlosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
