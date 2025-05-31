/*
  Warnings:

  - You are about to drop the column `aboveTargetLevel` on the `clo` table. All the data in the column will be lost.
  - You are about to drop the column `onTargetLevel` on the `clo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `clo` DROP COLUMN `aboveTargetLevel`,
    DROP COLUMN `onTargetLevel`;
