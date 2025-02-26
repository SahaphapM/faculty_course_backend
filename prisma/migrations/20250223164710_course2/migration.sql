-- DropForeignKey
ALTER TABLE `skill_collection` DROP FOREIGN KEY `skill_collection_courseId_fkey`;

-- DropIndex
DROP INDEX `skill_collection_courseId_fkey` ON `skill_collection`;

-- AddForeignKey
ALTER TABLE `skill_collection` ADD CONSTRAINT `skill_collection_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
