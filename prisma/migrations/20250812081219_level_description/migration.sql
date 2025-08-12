-- CreateTable
CREATE TABLE `level_description` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `curriculumId` INTEGER NOT NULL,

    INDEX `level_description_curriculumId_idx`(`curriculumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `level_description` ADD CONSTRAINT `level_description_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
