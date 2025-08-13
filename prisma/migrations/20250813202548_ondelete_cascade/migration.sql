-- DropForeignKey
ALTER TABLE `level_description` DROP FOREIGN KEY `level_description_curriculumId_fkey`;

-- AddForeignKey
ALTER TABLE `level_description` ADD CONSTRAINT `level_description_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
