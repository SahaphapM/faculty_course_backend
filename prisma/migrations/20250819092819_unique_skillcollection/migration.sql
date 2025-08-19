/*
  Warnings:

  - A unique constraint covering the columns `[studentId,courseId,cloId]` on the table `skill_collection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `skill_collection_studentId_courseId_cloId_key` ON `skill_collection`(`studentId`, `courseId`, `cloId`);
