/*
  Warnings:

  - Made the column `branchId` on table `curriculum` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `curriculum` DROP FOREIGN KEY `curriculum_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `subject_curriculumId_fkey`;

-- AlterTable
ALTER TABLE `curriculum` MODIFY `branchId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `curriculum_subjects` (
    `curriculumId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,

    INDEX `curriculum_subjects_subjectId_idx`(`subjectId`),
    INDEX `curriculum_subjects_curriculumId_idx`(`curriculumId`),
    PRIMARY KEY (`curriculumId`, `subjectId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `curriculum` ADD CONSTRAINT `curriculum_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_subjects` ADD CONSTRAINT `curriculum_subjects_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_subjects` ADD CONSTRAINT `curriculum_subjects_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructor` ADD CONSTRAINT `instructor_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
