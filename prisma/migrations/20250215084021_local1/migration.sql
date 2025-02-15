/*
  Warnings:

  - You are about to drop the column `description` on the `branch` table. All the data in the column will be lost.
  - You are about to drop the column `courseSpecId` on the `clo` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `subject` table. All the data in the column will be lost.
  - You are about to drop the `course_spec` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `curriculum_coordinators_instructor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `curriculum_subjects_subject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `thaiDescription` to the `branch` table without a default value. This is not possible if the table is not empty.
  - Made the column `curriculumId` on table `subject` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `branch` DROP FOREIGN KEY `branch_facultyId_fkey`;

-- DropForeignKey
ALTER TABLE `clo` DROP FOREIGN KEY `clo_courseSpecId_fkey`;

-- DropForeignKey
ALTER TABLE `course` DROP FOREIGN KEY `course_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `course_spec` DROP FOREIGN KEY `course_spec_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `course_spec` DROP FOREIGN KEY `course_spec_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_coordinators_instructor` DROP FOREIGN KEY `curriculum_coordinators_instructor_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_coordinators_instructor` DROP FOREIGN KEY `curriculum_coordinators_instructor_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects_subject` DROP FOREIGN KEY `curriculum_subjects_subject_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects_subject` DROP FOREIGN KEY `curriculum_subjects_subject_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `subject_curriculumId_fkey`;

-- DropIndex
DROP INDEX `clo_courseSpecId_idx` ON `clo`;

-- DropIndex
DROP INDEX `subject_code_key` ON `subject`;

-- AlterTable
ALTER TABLE `branch` DROP COLUMN `description`,
    ADD COLUMN `engDescription` VARCHAR(255) NULL,
    ADD COLUMN `thaiDescription` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `clo` DROP COLUMN `courseSpecId`,
    ADD COLUMN `subjectId` INTEGER NULL;

-- AlterTable
ALTER TABLE `subject` DROP COLUMN `code`,
    ADD COLUMN `credit` VARCHAR(10) NULL,
    ADD COLUMN `engDescription` TEXT NULL,
    ADD COLUMN `thaiDescription` TEXT NULL,
    ADD COLUMN `type` VARCHAR(255) NOT NULL DEFAULT 'บังคับ',
    MODIFY `curriculumId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `course_spec`;

-- DropTable
DROP TABLE `curriculum_coordinators_instructor`;

-- DropTable
DROP TABLE `curriculum_subjects_subject`;

-- CreateTable
CREATE TABLE `curriculum_coordinators` (
    `instructorId` INTEGER NOT NULL,
    `curriculumId` INTEGER NOT NULL,

    INDEX `curriculum_coordinators_instructorId_idx`(`instructorId`),
    INDEX `curriculum_coordinators_curriculumId_idx`(`curriculumId`),
    PRIMARY KEY (`instructorId`, `curriculumId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_subjects` (
    `curriculumId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,

    INDEX `curriculum_subjects_subjectId_idx`(`subjectId`),
    INDEX `curriculum_subjects_curriculumId_idx`(`curriculumId`),
    PRIMARY KEY (`curriculumId`, `subjectId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `thaiName` VARCHAR(255) NULL,
    `engName` VARCHAR(255) NULL,
    `subjectId` INTEGER NOT NULL,

    UNIQUE INDEX `lesson_subjectId_key`(`subjectId`),
    INDEX `lesson_subjectId_idx`(`subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `clo_subjectId_idx` ON `clo`(`subjectId`);

-- AddForeignKey
ALTER TABLE `branch` ADD CONSTRAINT `branch_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `faculty`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators` ADD CONSTRAINT `curriculum_coordinators_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_coordinators` ADD CONSTRAINT `curriculum_coordinators_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_subjects` ADD CONSTRAINT `curriculum_subjects_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_subjects` ADD CONSTRAINT `curriculum_subjects_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `lesson` ADD CONSTRAINT `lesson_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
