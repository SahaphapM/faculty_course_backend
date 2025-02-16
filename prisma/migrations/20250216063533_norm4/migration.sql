/*
  Warnings:

  - You are about to alter the column `minimumGrade` on the `curriculum` table. The data in that column could be lost. The data in that column will be cast from `VarChar(5)` to `Decimal(3,2)`.

*/
-- AlterTable
ALTER TABLE `curriculum` MODIFY `minimumGrade` DECIMAL(3, 2) NOT NULL;
