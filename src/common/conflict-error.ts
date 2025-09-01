import type { AppErrorCode } from "./error-codes";

// src/common/errors/conflict-error.ts
export interface ForeignKeyConflictError {
  code: AppErrorCode.FK_CONFLICT;
  message: string; // ข้อความอ่านเข้าใจได้
  entity: string; // เช่น 'PLO'
  id: number | string;
  blockers: Array<{
    relation: string; // เช่น 'CLO'
    count: number; // จำนวนลูกที่บล็อก
    field?: string; // เช่น 'ploId'
  }>;
  suggestions?: string[]; // ข้อเสนอการแก้ เช่น 'ย้าย/ลบ CLO', 'SetNull'
}
