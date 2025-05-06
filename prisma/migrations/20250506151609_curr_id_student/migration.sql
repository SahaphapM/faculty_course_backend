-- AlterTable
ALTER TABLE `student` ADD COLUMN `curriculumId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
