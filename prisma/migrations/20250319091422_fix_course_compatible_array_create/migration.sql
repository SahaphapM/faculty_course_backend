/*
  Warnings:

  - You are about to drop the column `term` on the `course` table. All the data in the column will be lost.
  - Added the required column `semester` to the `course` table without a default value. This is not possible if the table is not empty.
  - Made the column `year` on table `course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `course` DROP COLUMN `term`,
    ADD COLUMN `semester` VARCHAR(50) NOT NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true,
    MODIFY `year` SMALLINT NOT NULL;
