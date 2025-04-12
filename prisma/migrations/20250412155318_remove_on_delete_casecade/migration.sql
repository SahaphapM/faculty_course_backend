-- DropForeignKey
ALTER TABLE `curriculum_coordinators` DROP FOREIGN KEY `curriculum_coordinators_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_coordinators` DROP FOREIGN KEY `curriculum_coordinators_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects` DROP FOREIGN KEY `curriculum_subjects_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects` DROP FOREIGN KEY `curriculum_subjects_subjectId_fkey`;

-- AlterTable
ALTER TABLE `branch` MODIFY `thaiDescription` TEXT NULL;

-- AddForeignKey
ALTER TABLE `curriculum_subjects` ADD CONSTRAINT `curriculum_subjects_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_subjects` ADD CONSTRAINT `curriculum_subjects_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators` ADD CONSTRAINT `curriculum_coordinators_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators` ADD CONSTRAINT `curriculum_coordinators_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
