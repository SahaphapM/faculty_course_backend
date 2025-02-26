/*
  Warnings:

  - Added the required column `cloId` to the `skill_collection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skillId` to the `skill_collection` table without a default value. This is not possible if the table is not empty.
  - Made the column `studentId` on table `skill_collection` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `student_branchId_fkey`;

-- DropIndex
DROP INDEX `student_branchId_fkey` ON `student`;

-- AlterTable
ALTER TABLE `skill_collection` ADD COLUMN `cloId` INTEGER NOT NULL,
    ADD COLUMN `skillId` INTEGER NOT NULL,
    MODIFY `studentId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `student` MODIFY `branchId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `skill_collection_cloId_idx` ON `skill_collection`(`cloId`);

-- CreateIndex
CREATE INDEX `skill_collection_skillId_idx` ON `skill_collection`(`skillId`);

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_cloId_fkey` FOREIGN KEY (`cloId`) REFERENCES `clo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `student_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `branch`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `skill_collection` RENAME INDEX `skill_collection_courseId_fkey` TO `skill_collection_courseId_idx`;
