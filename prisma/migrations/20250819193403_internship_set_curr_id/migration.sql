-- AlterTable
ALTER TABLE `internship` ADD COLUMN `curriculumId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `internship_curriculumId_fkey` ON `internship`(`curriculumId`);

-- AddForeignKey
ALTER TABLE `internship` ADD CONSTRAINT `internship_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
