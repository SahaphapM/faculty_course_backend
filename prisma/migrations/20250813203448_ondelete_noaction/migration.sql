/*
  Warnings:

  - You are about to drop the `lesson` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `company_job_position` DROP FOREIGN KEY `company_job_position_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `company_job_position` DROP FOREIGN KEY `company_job_position_jobPositionId_fkey`;

-- DropForeignKey
ALTER TABLE `course` DROP FOREIGN KEY `course_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `internship` DROP FOREIGN KEY `internship_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `lesson` DROP FOREIGN KEY `lesson_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `skill_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_assessment` DROP FOREIGN KEY `skill_assessment_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_assessment` DROP FOREIGN KEY `skill_assessment_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `student_internship` DROP FOREIGN KEY `student_internship_internshipId_fkey`;

-- DropForeignKey
ALTER TABLE `student_internship` DROP FOREIGN KEY `student_internship_jobPositionId_fkey`;

-- DropForeignKey
ALTER TABLE `student_internship` DROP FOREIGN KEY `student_internship_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `subject_curriculumId_fkey`;

-- DropTable
DROP TABLE `lesson`;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_job_position` ADD CONSTRAINT `company_job_position_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_job_position` ADD CONSTRAINT `company_job_position_jobPositionId_fkey` FOREIGN KEY (`jobPositionId`) REFERENCES `job_position`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `internship` ADD CONSTRAINT `internship_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_internshipId_fkey` FOREIGN KEY (`internshipId`) REFERENCES `internship`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_jobPositionId_fkey` FOREIGN KEY (`jobPositionId`) REFERENCES `job_position`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_internship` ADD CONSTRAINT `student_internship_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_assessment` ADD CONSTRAINT `skill_assessment_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_assessment` ADD CONSTRAINT `skill_assessment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
