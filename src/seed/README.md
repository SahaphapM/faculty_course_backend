# Seed Module

Seed Module สำหรับจัดการการสร้างข้อมูลเริ่มต้นในฐานข้อมูล

## Features

- **Phase-based Seeding**: แบ่งการ seeding เป็น 5 phases
- **API Endpoints**: สามารถเรียกผ่าน HTTP API ได้
- **CLI Support**: รองรับการรันผ่าน command line
- **Security**: มี token protection และ environment flag
- **Idempotent**: สามารถรันซ้ำได้โดยไม่เกิด duplicate data

## API Endpoints

### POST /admin/seed
รัน seeding ทั้งหมด

**Headers:**
- `x-seed-token`: Token สำหรับ authentication (ถ้ามี)

**Response:**
```json
{
  "ok": true,
  "totalMs": 1234,
  "phases": [
    {
      "name": "Foundation",
      "durationMs": 100
    }
  ]
}
```

### POST /admin/seed/:phase
รัน seeding เฉพาะ phase ที่ระบุ

**Available Phases:**
- `foundation` - Users, Faculties, Branches, Curricula
- `academic-core` - Skills, PLOs, Subjects, CLOs
- `teaching-resources` - Instructors, Courses, Course Instructors
- `students` - Students
- `skill-collections` - Skill Collections

## Environment Variables

```bash
# Enable seed endpoint
ENABLE_SEED_ENDPOINT=true

# Seed token for authentication (optional)
SEED_TOKEN=your-secret-token
```

## CLI Usage

```bash
# Run via Prisma seed
npm run seed

# หรือ
npx prisma db seed
```

## Structure

```
src/seed/
├── seeds/           # Seed functions
│   ├── index.ts     # Export all seed functions
│   ├── user.seed.ts
│   ├── faculty-branch-curriculum.seed.ts
│   ├── skill.seed.ts
│   ├── student.seed.ts
│   ├── plo.seed.ts
│   ├── subject.seed.ts
│   ├── instructor.seed.ts
│   ├── course.seed.ts
│   └── clo.seed.ts
├── seed.service.ts  # Orchestration logic
├── seed.controller.ts # API endpoints
├── seed.module.ts   # Module configuration
└── README.md        # This file
```

## Dependencies

- PrismaService
- SkillCollectionsService
- NestJS Common
