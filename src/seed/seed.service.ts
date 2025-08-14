import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SkillCollectionsService } from 'src/modules/skill-collectiolns/skill-collectiolns.service';

// Import all seed functions from index
import {
  createUsers,
  createFacultiesAndBranches,
  createCurricula,
  createSkills,
  createStudents,
  createPLOs,
  createSubjects,
  createInstructors,
  createCourses,
  createCourseInstructors,
  createCLOs,
} from './seeds';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly skillCollectionsService: SkillCollectionsService,
  ) {}

  async seedAll() {
    const startedAt = Date.now();
    const phases: { name: string; durationMs: number }[] = [];

    // Phase 1
    phases.push(await this.runPhase('Foundation', async () => {
      await createUsers(this.prisma);
      await createFacultiesAndBranches(this.prisma);
      await createCurricula(this.prisma);
    }));

    // Phase 2
    phases.push(await this.runPhase('Academic Core', async () => {
      await createSkills(this.prisma);
      await createPLOs(this.prisma);
      await createSubjects(this.prisma);
      await createCLOs(this.prisma);
    }));

    // Phase 3
    phases.push(await this.runPhase('Teaching Resources', async () => {
      await createInstructors(this.prisma);
      await createCourses(this.prisma);
      await createCourseInstructors(this.prisma);
    }));

    // Phase 4
    phases.push(await this.runPhase('Students', async () => {
      await createStudents(this.prisma);
    }));

    // Phase 5
    phases.push(await this.runPhase('Skill Collections', async () => {
      await this.seedSkillCollections();
    }));

    const totalMs = Date.now() - startedAt;
    this.logger.log(`Seeding complete in ${totalMs}ms`);

    return { ok: true, totalMs, phases };
  }

  async seedPhase(phaseName: string) {
    const phaseMap: Record<string, () => Promise<void>> = {
      'foundation': async () => {
        await createUsers(this.prisma);
        await createFacultiesAndBranches(this.prisma);
        await createCurricula(this.prisma);
      },
      'academic-core': async () => {
        await createSkills(this.prisma);
        await createPLOs(this.prisma);
        await createSubjects(this.prisma);
        await createCLOs(this.prisma);
      },
      'teaching-resources': async () => {
        await createInstructors(this.prisma);
        await createCourses(this.prisma);
        await createCourseInstructors(this.prisma);
      },
      'students': async () => {
        await createStudents(this.prisma);
      },
      'skill-collections': async () => {
        await this.seedSkillCollections();
      },
    };

    const phase = phaseMap[phaseName.toLowerCase()];
    if (!phase) {
      throw new Error(`Unknown phase: ${phaseName}. Available phases: ${Object.keys(phaseMap).join(', ')}`);
    }

    return await this.runPhase(phaseName, phase);
  }

  private async runPhase(name: string, fn: () => Promise<void>) {
    this.logger.log(`Starting phase: ${name}`);
    const t0 = Date.now();
    await fn();
    const durationMs = Date.now() - t0;
    this.logger.log(`Finished phase: ${name} in ${durationMs}ms`);
    return { name, durationMs };
  }

  // Uses injected PrismaService and SkillCollectionsService
  private async seedSkillCollections() {
    // minimal data fetches
    const students = await this.prisma.student.findMany({ select: { code: true } });
    const course = await this.prisma.course.findFirst({ select: { id: true, subjectId: true } }); 
    const clos = await this.prisma.clo.findMany({ select: { id: true, subjectId: true, expectSkillLevel: true, skillId: true } });

      const relatedClos = clos.filter((c) => c.subjectId === course.subjectId);
      for (const clo of relatedClos) {
        const studentScoreList = students.map((s) => ({
          studentCode: s.code,
          gainedLevel: Math.floor(Math.random() * 4) + 1
        }));
        console.log("creating for clo id: " + clo.id)
        await this.skillCollectionsService.importSkillCollections(course.id, clo.id, studentScoreList);
       
      }
    
  }
}
