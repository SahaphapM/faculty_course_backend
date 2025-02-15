/*
  Warnings:

  - You are about to drop the column `engDescription` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `thaiDescription` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `course_instructors_instructor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `curriculum_subjects` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[engName]` on the table `instructor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `instructor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[thaiName]` on the table `instructor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[instructorId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Made the column `subjectId` on table `course` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `course_instructors_instructor` DROP FOREIGN KEY `course_instructors_instructor_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `course_instructors_instructor` DROP FOREIGN KEY `course_instructors_instructor_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects` DROP FOREIGN KEY `curriculum_subjects_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects` DROP FOREIGN KEY `curriculum_subjects_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_teacherId_fkey`;

-- DropIndex
DROP INDEX `user_teacherId_key` ON `user`;

-- AlterTable
ALTER TABLE `course` DROP COLUMN `engDescription`,
    DROP COLUMN `thaiDescription`,
    MODIFY `subjectId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `teacherId`,
    ADD COLUMN `instructorId` INTEGER NULL,
    MODIFY `avatarUrl` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `course_instructors_instructor`;

-- DropTable
DROP TABLE `curriculum_subjects`;

-- CreateTable
CREATE TABLE `course_instructor` (
    `instructorId` INTEGER NOT NULL,
    `courseId` INTEGER NOT NULL,

    INDEX `course_instructor_instructorId_idx`(`instructorId`),
    INDEX `course_instructor_courseId_idx`(`courseId`),
    PRIMARY KEY (`instructorId`, `courseId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `instructor_engName_key` ON `instructor`(`engName`);

-- CreateIndex
CREATE UNIQUE INDEX `instructor_email_key` ON `instructor`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `instructor_thaiName_key` ON `instructor`(`thaiName`);

-- CreateIndex
CREATE UNIQUE INDEX `user_instructorId_key` ON `user`(`instructorId`);

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_instructor` ADD CONSTRAINT `course_instructor_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `course_instructor` ADD CONSTRAINT `course_instructor_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
