-- DropForeignKey
ALTER TABLE `branch` DROP FOREIGN KEY `branch_facultyId_fkey`;

-- DropForeignKey
ALTER TABLE `clo` DROP FOREIGN KEY `clo_ploId_fkey`;

-- DropForeignKey
ALTER TABLE `clo` DROP FOREIGN KEY `clo_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `course` DROP FOREIGN KEY `course_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `course_instructor` DROP FOREIGN KEY `course_instructor_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `instructor` DROP FOREIGN KEY `instructor_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `plo` DROP FOREIGN KEY `plo_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `skill_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_assessment` DROP FOREIGN KEY `skill_assessment_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_cloId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `student_branchId_fkey`;

-- AlterTable
ALTER TABLE `curriculum` ADD COLUMN `archivedAt` DATETIME(0) NULL;

-- AddForeignKey
ALTER TABLE `branch` ADD CONSTRAINT `branch_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `faculty`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_instructor` ADD CONSTRAINT `course_instructor_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `instructor` ADD CONSTRAINT `instructor_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE `plo` ADD CONSTRAINT `plo_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_ploId_fkey` FOREIGN KEY (`ploId`) REFERENCES `plo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `skill`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_cloId_fkey` FOREIGN KEY (`cloId`) REFERENCES `clo`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_assessment` ADD CONSTRAINT `skill_assessment_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
