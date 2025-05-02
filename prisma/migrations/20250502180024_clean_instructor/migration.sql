/*
  Warnings:

  - You are about to drop the column `bio` on the `instructor` table. All the data in the column will be lost.
  - You are about to drop the column `officeRoom` on the `instructor` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `instructor` table. All the data in the column will be lost.
  - You are about to drop the column `socials` on the `instructor` table. All the data in the column will be lost.
  - You are about to drop the column `specialists` on the `instructor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `instructor` DROP COLUMN `bio`,
    DROP COLUMN `officeRoom`,
    DROP COLUMN `picture`,
    DROP COLUMN `socials`,
    DROP COLUMN `specialists`;
