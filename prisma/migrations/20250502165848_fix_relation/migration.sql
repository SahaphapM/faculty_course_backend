/*
  Warnings:

  - You are about to alter the column `code` on the `subject` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to drop the `curriculum_subjects` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `subject` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `curriculum_subjects` DROP FOREIGN KEY `curriculum_subjects_curriculumId_fkey`;

-- DropForeignKey
ALTER TABLE `curriculum_subjects` DROP FOREIGN KEY `curriculum_subjects_subjectId_fkey`;

-- AlterTable
ALTER TABLE `subject` MODIFY `code` VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE `curriculum_subjects`;

-- CreateIndex
CREATE UNIQUE INDEX `subject_code_key` ON `subject`(`code`);

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
