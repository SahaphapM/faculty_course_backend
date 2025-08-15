/*
  Warnings:

  - You are about to drop the column `code` on the `coordinator` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `coordinator` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `coordinator` table. All the data in the column will be lost.
  - You are about to drop the column `tel` on the `coordinator` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[instructorId,studentId,coordinatorId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_instructorId_fkey`;

-- DropIndex
DROP INDEX `coordinator_code_key` ON `coordinator`;

-- DropIndex
DROP INDEX `coordinator_email_key` ON `coordinator`;

-- DropIndex
DROP INDEX `user_instructorId_studentId_key` ON `user`;

-- AlterTable
ALTER TABLE `coordinator` DROP COLUMN `code`,
    DROP COLUMN `email`,
    DROP COLUMN `position`,
    DROP COLUMN `tel`;

-- CreateIndex
CREATE UNIQUE INDEX `user_instructorId_studentId_coordinatorId_key` ON `user`(`instructorId`, `studentId`, `coordinatorId`);


