/*
  Warnings:

  - You are about to alter the column `semester` on the `course` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `course` MODIFY `semester` TINYINT NOT NULL;
