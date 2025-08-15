-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructor`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
