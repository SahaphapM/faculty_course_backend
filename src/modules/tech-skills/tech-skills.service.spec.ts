import { Test, TestingModule } from '@nestjs/testing';
import { TechSkillsService } from './tech-skills.service';

describe('TechSkillsService', () => {
  let service: TechSkillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TechSkillsService],
    }).compile();

    service = module.get<TechSkillsService>(TechSkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
