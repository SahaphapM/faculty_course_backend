import { Test, TestingModule } from '@nestjs/testing';
import { TechSkillsController } from './tech-skills.controller';
import { TechSkillsService } from './tech-skills.service';

describe('TechSkillsController', () => {
  let controller: TechSkillsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechSkillsController],
      providers: [TechSkillsService],
    }).compile();

    controller = module.get<TechSkillsController>(TechSkillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
