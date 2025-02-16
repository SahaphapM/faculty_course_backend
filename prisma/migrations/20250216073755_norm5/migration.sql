/*
  Warnings:

  - Made the column `curriculumId` on table `plo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `plo` DROP FOREIGN KEY `plo_curriculumId_fkey`;

-- AlterTable
ALTER TABLE `plo` MODIFY `curriculumId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `plo` ADD CONSTRAINT `plo_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
