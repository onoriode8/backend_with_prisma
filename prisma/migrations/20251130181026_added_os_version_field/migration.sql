/*
  Warnings:

  - Added the required column `OSVersion` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refreshtoken` ADD COLUMN `OSVersion` VARCHAR(191) NOT NULL;
