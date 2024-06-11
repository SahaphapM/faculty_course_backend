import { Test, TestingModule } from '@nestjs/testing';
import { ClosService } from './clos.service';

describe('ClosService', () => {
  let service: ClosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClosService],
    }).compile();

    service = module.get<ClosService>(ClosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
