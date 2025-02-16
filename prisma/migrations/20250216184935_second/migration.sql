-- DropForeignKey
ALTER TABLE `instructor` DROP FOREIGN KEY `instructor_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `student_branchId_fkey`;

-- DropIndex
DROP INDEX `instructor_branchId_key` ON `instructor`;

-- DropIndex
DROP INDEX `student_branchId_key` ON `student`;

-- AddForeignKey
ALTER TABLE `plo` ADD CONSTRAINT `plo_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
