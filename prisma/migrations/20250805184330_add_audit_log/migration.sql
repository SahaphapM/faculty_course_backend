-- AlterTable
ALTER TABLE `skill_assessment` MODIFY `curriculumLevel` INTEGER NULL DEFAULT 0,
    MODIFY `companyLevel` INTEGER NULL DEFAULT 0,
    MODIFY `finalLevel` INTEGER NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource` VARCHAR(100) NOT NULL,
    `resourceId` VARCHAR(255) NULL,
    `timestamp` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `metadata` TEXT NULL,

    INDEX `audit_log_userId_idx`(`userId`),
    INDEX `audit_log_action_idx`(`action`),
    INDEX `audit_log_resource_idx`(`resource`),
    INDEX `audit_log_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
