import { Prisma } from '@prisma/client';
import { Curriculum } from 'src/generated/nestjs-dto/curriculum.entity';
import { Course } from 'src/generated/nestjs-dto/course.entity';
import { Subject } from 'src/generated/nestjs-dto/subject.entity';

/**
 * Lightweight deep partial type for factory overrides.
 */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

let curriculumSeq = 1;
let courseSeq = 1;
let subjectSeq = 1;

/**
 * Utility to normalize a value into Prisma.Decimal
 */
const asDecimal = (v: number | string | Prisma.Decimal): Prisma.Decimal => {
  if (v instanceof Prisma.Decimal) return v;
  return new Prisma.Decimal(v);
};

/**
 * Create a mock Subject (minimal) for embedding in Course/Curriculum relations.
 */
export function makeSubject(overrides: DeepPartial<Subject> = {}): Subject {
  const id = overrides.id ?? subjectSeq++;
  return {
    id,
    code: overrides.code ?? `SUBJ${String(id).padStart(3, '0')}`,
    curriculumId: overrides.curriculumId ?? 1,
    thaiName: overrides.thaiName ?? `วิชาที่ ${id}`,
    engName: overrides.engName ?? `Subject ${id}`,
    credit: overrides.credit ?? '3',
    type: overrides.type ?? 'บังคับ',
    thaiDescription: overrides.thaiDescription ?? null,
    engDescription: overrides.engDescription ?? null,
    isRoot: overrides.isRoot ?? false,
    clos: (overrides.clos as any) ?? [],
    courses: (overrides.courses as any) ?? [],
    curriculum: (overrides.curriculum as any) ?? undefined!,
    ...overrides,
  };
}

/**
 * Factory for Curriculum entities.
 * Ensures all required scalar fields exist and supplies sane defaults.
 */
export function makeCurriculum(
  overrides: DeepPartial<Curriculum> = {},
): Curriculum {
  const id = overrides.id ?? curriculumSeq++;
  const minimumGrade =
    overrides.minimumGrade !== undefined
      ? asDecimal(overrides.minimumGrade as any)
      : new Prisma.Decimal('2.00');

  return {
    id,
    branchId: overrides.branchId ?? 1,
    code: overrides.code ?? `CURR${String(id).padStart(3, '0')}`,
    thaiName: overrides.thaiName ?? `หลักสูตรที่ ${id}`,
    engName: overrides.engName ?? `Curriculum ${id}`,
    thaiDegree: overrides.thaiDegree ?? 'วิศวกรรมศาสตรบัณฑิต',
    engDegree: overrides.engDegree ?? 'Bachelor of Engineering',
    period: overrides.period ?? 4,
    thaiDescription: overrides.thaiDescription ?? null,
    engDescription: overrides.engDescription ?? null,
    branch: (overrides.branch as any) ?? undefined!,
    coordinators: (overrides.coordinators as any) ?? [],
    plos: (overrides.plos as any) ?? [],
    skills: (overrides.skills as any) ?? [],
    students: (overrides.students as any) ?? [],
    subjects: (overrides.subjects as any) ?? [],
    level_descriptions: (overrides.level_descriptions as any) ?? [],
    ...overrides,
    minimumGrade: minimumGrade as Prisma.Decimal,
  };
}

/**
 * Factory for Course entities.
 * Provides default values and injects a minimal Subject unless explicitly suppressed.
 */
export function makeCourse(overrides: DeepPartial<Course> = {}): Course {
  const id = overrides.id ?? courseSeq++;
  const subject: Subject | undefined =
    overrides.subject === null
      ? undefined
      : overrides.subject
        ? (overrides.subject as Subject)
        : makeSubject({ id: overrides.subjectId });

  const finalSubjectId = overrides.subjectId ?? (subject ? subject.id : 1);
  return {
    ...overrides,
    id,
    active: overrides.active ?? true,
    semester: overrides.semester ?? 1,
    year: overrides.year ?? new Date().getFullYear(),
    subjectId: finalSubjectId,
    subject,
    course_instructors: (overrides.course_instructors as any) ?? [],
    skill_collections: (overrides.skill_collections as any) ?? [],
  };
}

/**
 * Reset internal sequence counters (useful between test suites).
 */
export function resetEntityFactorySequences() {
  curriculumSeq = 1;
  courseSeq = 1;
  subjectSeq = 1;
}
