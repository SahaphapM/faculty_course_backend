/*
  Warnings:

  - You are about to drop the column `expect` on the `skill_collection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `skill_collection` DROP COLUMN `expect`,
    ADD COLUMN `expected` TINYINT NOT NULL DEFAULT 0;
