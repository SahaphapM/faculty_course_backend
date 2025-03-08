-- AlterTable
ALTER TABLE `student` MODIFY `branchId` INTEGER NULL,
    MODIFY `thaiName` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `skill_collection_studentId_cloId_courseId_idx` ON `skill_collection`(`studentId`, `cloId`, `courseId`);

-- CreateIndex
CREATE INDEX `student_code_idx` ON `student`(`code`);
