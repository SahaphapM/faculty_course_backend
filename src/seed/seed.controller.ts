import { Controller, Post, Headers, ForbiddenException, Param } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('admin/seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seedAll(@Headers('x-seed-token') token?: string) {
    // Basic protection via env flag + token
    const enabled = process.env.ENABLE_SEED_ENDPOINT === 'true';
    const expected = process.env.SEED_TOKEN;

    if (!enabled) {
      throw new ForbiddenException('Seed endpoint disabled');
    }
    if (expected && token !== expected) {
      throw new ForbiddenException('Invalid seed token');
    }

    return this.seedService.seedAll();
  }

  @Post(':phase')
  async seedPhase(
    @Param('phase') phase: string,
    @Headers('x-seed-token') token?: string
  ) {
    // Basic protection via env flag + token
    const enabled = process.env.ENABLE_SEED_ENDPOINT === 'true';
    const expected = process.env.SEED_TOKEN;

    if (!enabled) {
      throw new ForbiddenException('Seed endpoint disabled');
    }
    if (expected && token !== expected) {
      throw new ForbiddenException('Invalid seed token');
    }

    return this.seedService.seedPhase(phase);
  }
}
