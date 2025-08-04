/*
  Warnings:

  - You are about to alter the column `token` on the `internship` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(32)`.

*/
-- DropIndex
DROP INDEX `internship_token_key` ON `internship`;

-- AlterTable
ALTER TABLE `internship` MODIFY `token` VARCHAR(32) NULL;
