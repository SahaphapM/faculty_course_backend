/*
  Warnings:

  - You are about to drop the column `name` on the `faculty` table. All the data in the column will be lost.
  - Added the required column `thaiName` to the `faculty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `faculty` DROP COLUMN `name`,
    ADD COLUMN `thaiName` VARCHAR(255) NOT NULL;
