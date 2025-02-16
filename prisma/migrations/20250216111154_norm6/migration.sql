/*
  Warnings:

  - You are about to drop the column `description` on the `faculty` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `faculty` DROP COLUMN `description`,
    ADD COLUMN `engDescription` TEXT NULL,
    ADD COLUMN `thaiDescription` TEXT NULL;
