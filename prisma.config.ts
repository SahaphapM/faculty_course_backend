// Prisma CLI configuration (replaces deprecated package.json "prisma" field)
// See: https://pris.ly/prisma-config
// Loads environment variables explicitly (not automatic in prisma.config.ts)
import 'dotenv/config';
import path from 'node:path';
import type { PrismaConfig } from 'prisma';

export default {
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
} satisfies PrismaConfig;
