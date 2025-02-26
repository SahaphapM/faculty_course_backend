/*
  Warnings:

  - You are about to drop the column `cloId` on the `skill` table. All the data in the column will be lost.
  - You are about to drop the column `ExpectedLevelId` on the `skill_collection` table. All the data in the column will be lost.
  - You are about to drop the column `courseEnrollmentId` on the `skill_collection` table. All the data in the column will be lost.
  - You are about to drop the column `gainedLevel` on the `skill_collection` table. All the data in the column will be lost.
  - You are about to drop the column `passed` on the `skill_collection` table. All the data in the column will be lost.
  - You are about to alter the column `socials` on the `student` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Json`.
  - You are about to drop the `course_enrollment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[instructorId,studentId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `skill_collection` table without a default value. This is not possible if the table is not empty.
  - Made the column `branchId` on table `student` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `course_enrollment` DROP FOREIGN KEY `course_enrollment_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `course_enrollment` DROP FOREIGN KEY `course_enrollment_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `skill` DROP FOREIGN KEY `skill_cloId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_ExpectedLevelId_fkey`;

-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_courseEnrollmentId_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `student_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_studentId_fkey`;

-- DropIndex
DROP INDEX `skill_cloId_fkey` ON `skill`;

-- DropIndex
DROP INDEX `skill_collection_ExpectedLevelId_idx` ON `skill_collection`;

-- DropIndex
DROP INDEX `skill_collection_courseEnrollmentId_idx` ON `skill_collection`;

-- DropIndex
DROP INDEX `student_branchId_fkey` ON `student`;

-- AlterTable
ALTER TABLE `clo` ADD COLUMN `skillId` INTEGER NULL;

-- AlterTable
ALTER TABLE `skill` DROP COLUMN `cloId`;

-- AlterTable
ALTER TABLE `skill_collection` DROP COLUMN `ExpectedLevelId`,
    DROP COLUMN `courseEnrollmentId`,
    DROP COLUMN `gainedLevel`,
    DROP COLUMN `passed`,
    ADD COLUMN `courseId` INTEGER NOT NULL,
    ADD COLUMN `expect` TINYINT NOT NULL DEFAULT 0,
    ADD COLUMN `gained` TINYINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `student` ADD COLUMN `userId` INTEGER NULL,
    MODIFY `socials` JSON NULL,
    MODIFY `branchId` INTEGER NOT NULL,
    MODIFY `thaiName` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `course_enrollment`;

-- CreateIndex
CREATE INDEX `clo_skillId_idx` ON `clo`(`skillId`);

-- CreateIndex
CREATE UNIQUE INDEX `user_instructorId_studentId_key` ON `user`(`instructorId`, `studentId`);

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
