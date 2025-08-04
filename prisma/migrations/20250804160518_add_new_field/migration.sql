/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `internship` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `internship` ADD COLUMN `token` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `internship_token_key` ON `internship`(`token`);
