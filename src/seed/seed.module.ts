import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SkillCollectionsModule } from 'src/modules/skill-collectiolns/skill-collectiolns.module';

@Module({
  imports: [PrismaModule, SkillCollectionsModule],
  providers: [SeedService],
  controllers: [SeedController],
  exports: [SeedService],
})
export class SeedModule {}
