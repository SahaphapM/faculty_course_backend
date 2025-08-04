import { Test, TestingModule } from '@nestjs/testing';
import { SkillAssessmentsService } from './skill-assessments.service';

describe('SkillAssessmentsService', () => {
  let service: SkillAssessmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SkillAssessmentsService],
    }).compile();

    service = module.get<SkillAssessmentsService>(SkillAssessmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
