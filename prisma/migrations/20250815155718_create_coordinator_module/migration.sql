/*
  Warnings:

  - The primary key for the `curriculum_coordinators` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `instructorId` on the `curriculum_coordinators` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[coordinatorId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coordinatorId` to the `curriculum_coordinators` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `curriculum_coordinators` DROP FOREIGN KEY `curriculum_coordinators_instructorId_fkey`;

-- DropIndex
DROP INDEX `curriculum_coordinators_instructorId_idx` ON `curriculum_coordinators`;

-- AlterTable
ALTER TABLE `curriculum_coordinators` DROP PRIMARY KEY,
    DROP COLUMN `instructorId`,
    ADD COLUMN `coordinatorId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`coordinatorId`, `curriculumId`);

-- AlterTable
ALTER TABLE `user` ADD COLUMN `coordinatorId` INTEGER NULL;

-- CreateTable
CREATE TABLE `coordinator` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NULL,
    `thaiName` VARCHAR(255) NOT NULL DEFAULT '',
    `engName` VARCHAR(255) NOT NULL DEFAULT '',
    `tel` VARCHAR(255) NULL,
    `position` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `coordinator_code_key`(`code`),
    UNIQUE INDEX `coordinator_thaiName_key`(`thaiName`),
    UNIQUE INDEX `coordinator_engName_key`(`engName`),
    UNIQUE INDEX `coordinator_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `curriculum_coordinators_coordinatorId_idx` ON `curriculum_coordinators`(`coordinatorId`);

-- CreateIndex
CREATE UNIQUE INDEX `user_coordinatorId_key` ON `user`(`coordinatorId`);

-- AddForeignKey
ALTER TABLE `curriculum_coordinators` ADD CONSTRAINT `curriculum_coordinators_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `coordinator`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `coordinator`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
