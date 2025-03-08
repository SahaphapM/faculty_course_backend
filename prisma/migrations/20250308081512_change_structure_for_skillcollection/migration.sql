/*
  Warnings:

  - You are about to drop the `curriculum_subjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `curriculum_subjects` DROP FOREIGN KEY `curriculum_subjects_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects` DROP FOREIGN KEY `curriculum_subjects_subjectId_fkey`;

-- AlterTable
ALTER TABLE `skill_collection` MODIFY `passed` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `curriculum_subjects`;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
