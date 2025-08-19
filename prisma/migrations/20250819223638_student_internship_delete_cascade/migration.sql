/*
  Warnings:

  - A unique constraint covering the columns `[studentId,internshipId]` on the table `student_internship` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `internship` DROP FOREIGN KEY `internship_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `student_internship` DROP FOREIGN KEY `student_internship_internshipId_fkey`;

-- DropForeignKey
ALTER TABLE `student_internship` DROP FOREIGN KEY `student_internship_jobPositionId_fkey`;

-- CreateIndex
CREATE UNIQUE INDEX `student_internship_studentId_internshipId_key` ON `student_internship`(`studentId`, `internshipId`);

-- AddForeignKey
ALTER TABLE `internship` ADD CONSTRAINT `internship_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_internshipId_fkey` FOREIGN KEY (`internshipId`) REFERENCES `internship`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_jobPositionId_fkey` FOREIGN KEY (`jobPositionId`) REFERENCES `job_position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
