/*
  Warnings:

  - You are about to drop the `_companyTojob_position` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_companyTojob_position` DROP FOREIGN KEY `_companyTojob_position_A_fkey`;

-- DropForeignKey
ALTER TABLE `_companyTojob_position` DROP FOREIGN KEY `_companyTojob_position_B_fkey`;

-- DropTable
DROP TABLE `_companyTojob_position`;

-- CreateTable
CREATE TABLE `company_job_position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `jobPositionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `company_job_position` ADD CONSTRAINT `company_job_position_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_job_position` ADD CONSTRAINT `company_job_position_jobPositionId_fkey` FOREIGN KEY (`jobPositionId`) REFERENCES `job_position`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
