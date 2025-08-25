/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `coordinator` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `coordinator` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `curriculum` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX `coordinator_userId_key` ON `coordinator`(`userId`);
