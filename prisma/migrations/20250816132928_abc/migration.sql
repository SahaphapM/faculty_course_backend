/*
  Warnings:

  - The primary key for the `course_instructor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `course_instructor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `course_instructor` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `instructorId` INTEGER NULL,
    MODIFY `courseId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);
