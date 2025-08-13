import { Test, TestingModule } from '@nestjs/testing';
import { InternshipsService } from './internships.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('InternshipsService', () => {
  let service: InternshipsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InternshipsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InternshipsService>(InternshipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
