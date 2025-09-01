export enum AppErrorCode {
  FK_CONFLICT = 'FK_CONFLICT', // ลบไม่ได้เพราะมีลูกอ้างอยู่
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
}
