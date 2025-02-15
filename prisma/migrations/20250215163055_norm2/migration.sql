/*
  Warnings:

  - Made the column `engName` on table `instructor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thaiName` on table `instructor` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `instructor` MODIFY `engName` VARCHAR(255) NOT NULL,
    MODIFY `code` VARCHAR(255) NULL,
    MODIFY `thaiName` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `subject` ADD COLUMN `code` VARCHAR(191) NOT NULL;
