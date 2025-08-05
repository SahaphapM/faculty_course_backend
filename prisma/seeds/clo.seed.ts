import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCLOs() {
  console.log('🌱 Creating CLOs...');
  
  const curriculum = await prisma.curriculum.findFirst();
  if (!curriculum) {
    throw new Error('No curriculum found. Please run curriculum seed first.');
  }

  // Get created subjects, PLOs, and skills
  const createdSubjects = await prisma.subject.findMany({
    where: { curriculumId: curriculum.id },
  });
  const createdPlos = await prisma.plo.findMany({
    where: { curriculumId: curriculum.id },
  });
  const createdSkills = await prisma.skill.findMany({
    where: { curriculumId: curriculum.id },
  });

  if (createdPlos.length === 0 || createdSkills.length === 0 || createdSubjects.length === 0) {
    console.warn('Missing PLOs, skills, or subjects. Skipping CLO creation.');
    return;
  }

  const cloData = [];
  
  // Create 2 CLOs per subject (first 6 subjects)
  for (let i = 0; i < Math.min(6, createdSubjects.length); i++) {
    const subject = createdSubjects[i];
    const hardSkills = createdSkills.filter(s => s.domain === 'hard-skill');
    const softSkills = createdSkills.filter(s => s.domain === 'soft-skill');
    
    // CLO 1: Hard skill
    if (hardSkills.length > i) {
      cloData.push({
        name: `CLO${i + 1}.1`,
        ploId: createdPlos[1]?.id || createdPlos[0].id, // PLO2 (ทักษะ) or first PLO
        subjectId: subject.id,
        skillId: hardSkills[i % hardSkills.length].id,
        thaiDescription: `สามารถ${hardSkills[i % hardSkills.length].thaiName}ได้`,
        engDescription: `Can ${hardSkills[i % hardSkills.length].engName}`,
        expectSkillLevel: 3 + (i % 3), // 3-5
      });
    }
    
    // CLO 2: Soft skill
    if (softSkills.length > i) {
      cloData.push({
        name: `CLO${i + 1}.2`,
        ploId: createdPlos[2]?.id || createdPlos[0].id, // PLO3 (คุณลักษณะบุคคล) or first PLO
        subjectId: subject.id,
        skillId: softSkills[i % softSkills.length].id,
        thaiDescription: `มี${softSkills[i % softSkills.length].thaiName}`,
        engDescription: `Have ${softSkills[i % softSkills.length].engName}`,
        expectSkillLevel: 3 + (i % 2), // 3-4
      });
    }
  }

  if (cloData.length > 0) {
    await prisma.clo.createMany({
      data: cloData,
      skipDuplicates: true,
    });
    console.log(`✅ Created ${cloData.length} CLOs`);
  }
}
