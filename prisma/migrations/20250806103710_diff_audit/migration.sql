-- AlterTable
ALTER TABLE `audit_log` ADD COLUMN `after` JSON NULL,
    ADD COLUMN `before` JSON NULL;
