-- DropForeignKey
ALTER TABLE `curriculum_subjects` DROP FOREIGN KEY `curriculum_subjects_subjectId_fkey`;

-- AddForeignKey
ALTER TABLE `curriculum_subjects` ADD CONSTRAINT `curriculum_subjects_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
