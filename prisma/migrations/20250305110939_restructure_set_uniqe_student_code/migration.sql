/*
  Warnings:

  - You are about to drop the column `ExpectedLevelId` on the `skill_collection` table. All the data in the column will be lost.
  - You are about to drop the column `courseEnrollmentId` on the `skill_collection` table. All the data in the column will be lost.
  - You are about to drop the `course_enrollment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skill_expected_level` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `student` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `course_enrollment` DROP FOREIGN KEY `course_enrollment_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `course_enrollment` DROP FOREIGN KEY `course_enrollment_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_ExpectedLevelId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_courseEnrollmentId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_expected_level` DROP FOREIGN KEY `skill_expected_level_skillId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_expected_level` DROP FOREIGN KEY `skill_expected_level_subjectId_fkey`;

-- DropIndex
DROP INDEX `skill_collection_ExpectedLevelId_idx` ON `skill_collection`;

-- DropIndex
DROP INDEX `skill_collection_courseEnrollmentId_idx` ON `skill_collection`;

-- AlterTable
ALTER TABLE `clo` ADD COLUMN `expectSkillLevel` TINYINT NULL;

-- AlterTable
ALTER TABLE `skill_collection` DROP COLUMN `ExpectedLevelId`,
    DROP COLUMN `courseEnrollmentId`,
    ADD COLUMN `cloId` INTEGER NULL,
    ADD COLUMN `courseId` INTEGER NULL;

-- DropTable
DROP TABLE `course_enrollment`;

-- DropTable
DROP TABLE `skill_expected_level`;

-- CreateIndex
CREATE INDEX `skill_collection_cloId_idx` ON `skill_collection`(`cloId`);

-- CreateIndex
CREATE INDEX `skill_collection_courseId_idx` ON `skill_collection`(`courseId`);

-- CreateIndex
CREATE UNIQUE INDEX `student_code_key` ON `student`(`code`);

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_cloId_fkey` FOREIGN KEY (`cloId`) REFERENCES `clo`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
