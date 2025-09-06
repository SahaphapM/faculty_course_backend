-- DropForeignKey
ALTER TABLE `company_job_position` DROP FOREIGN KEY `company_job_position_jobPositionId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum` DROP FOREIGN KEY `curriculum_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `internship` DROP FOREIGN KEY `internship_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `plo` DROP FOREIGN KEY `plo_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `skill_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `student_internship` DROP FOREIGN KEY `student_internship_internshipId_fkey`;

-- DropForeignKey
ALTER TABLE `student_internship` DROP FOREIGN KEY `student_internship_jobPositionId_fkey`;

-- AddForeignKey
ALTER TABLE `curriculum` ADD CONSTRAINT `curriculum_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plo` ADD CONSTRAINT `plo_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_job_position` ADD CONSTRAINT `company_job_position_jobPositionId_fkey` FOREIGN KEY (`jobPositionId`) REFERENCES `job_position`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `internship` ADD CONSTRAINT `internship_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_internshipId_fkey` FOREIGN KEY (`internshipId`) REFERENCES `internship`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_jobPositionId_fkey` FOREIGN KEY (`jobPositionId`) REFERENCES `job_position`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
