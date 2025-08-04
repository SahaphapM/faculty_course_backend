import { Test, TestingModule } from '@nestjs/testing';
import { SkillAssessmentsController } from './skill-assessments.controller';
import { SkillAssessmentsService } from './skill-assessments.service';

describe('SkillAssessmentsController', () => {
  let controller: SkillAssessmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillAssessmentsController],
      providers: [SkillAssessmentsService],
    }).compile();

    controller = module.get<SkillAssessmentsController>(SkillAssessmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
