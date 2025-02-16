/*
  Warnings:

  - You are about to alter the column `period` on the `curriculum` table. The data in that column could be lost. The data in that column will be cast from `Int` to `TinyInt`.

*/
-- DropForeignKey
ALTER TABLE `curriculum` DROP FOREIGN KEY `curriculum_branchId_fkey`;

-- AlterTable
ALTER TABLE `curriculum` MODIFY `period` TINYINT NOT NULL,
    MODIFY `minimumGrade` VARCHAR(5) NOT NULL;

-- AddForeignKey
ALTER TABLE `curriculum` ADD CONSTRAINT `curriculum_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
