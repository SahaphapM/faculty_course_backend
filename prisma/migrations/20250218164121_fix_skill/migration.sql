/*
  Warnings:

  - You are about to drop the column `name` on the `skill` table. All the data in the column will be lost.
  - Added the required column `domain` to the `skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engDescription` to the `skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `engName` to the `skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thaiDescription` to the `skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thaiName` to the `skill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `clo` DROP FOREIGN KEY `clo_ploId_fkey`;

-- DropForeignKey
ALTER TABLE `clo` DROP FOREIGN KEY `clo_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `lesson` DROP FOREIGN KEY `lesson_subjectId_fkey`;

-- AlterTable
ALTER TABLE `skill` DROP COLUMN `name`,
    ADD COLUMN `domain` VARCHAR(100) NOT NULL,
    ADD COLUMN `engDescription` TEXT NOT NULL,
    ADD COLUMN `engName` VARCHAR(255) NOT NULL,
    ADD COLUMN `thaiDescription` TEXT NOT NULL,
    ADD COLUMN `thaiName` VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_ploId_fkey` FOREIGN KEY (`ploId`) REFERENCES `plo`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clo` ADD CONSTRAINT `clo_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lesson` ADD CONSTRAINT `lesson_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
