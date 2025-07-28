import { Test, TestingModule } from '@nestjs/testing';
import { InternshipsController } from './internships.controller';
import { InternshipsService } from './internships.service';

describe('InternshipsController', () => {
  let controller: InternshipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternshipsController],
      providers: [InternshipsService],
    }).compile();

    controller = module.get<InternshipsController>(InternshipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
