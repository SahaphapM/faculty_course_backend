/*
  Warnings:

  - You are about to alter the column `metadata` on the `audit_log` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.

*/
-- AlterTable
ALTER TABLE `audit_log` MODIFY `metadata` JSON NULL;
