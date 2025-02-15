/*
  Warnings:

  - You are about to drop the column `name` on the `course` table. All the data in the column will be lost.
  - Made the column `curriculumId` on table `skill` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `skill_curriculumId_fkey`;

-- DropIndex
DROP INDEX `skill_curriculumId_fkey` ON `skill`;

-- AlterTable
ALTER TABLE `course` DROP COLUMN `name`;

-- AlterTable
ALTER TABLE `skill` MODIFY `curriculumId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
