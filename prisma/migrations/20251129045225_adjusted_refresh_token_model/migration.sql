/*
  Warnings:

  - You are about to drop the column `version` on the `refreshtoken` table. All the data in the column will be lost.
  - You are about to drop the column `window` on the `refreshtoken` table. All the data in the column will be lost.
  - Added the required column `browser` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `browserVersion` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refreshtoken` DROP COLUMN `version`,
    DROP COLUMN `window`,
    ADD COLUMN `browser` VARCHAR(191) NOT NULL,
    ADD COLUMN `browserVersion` VARCHAR(191) NOT NULL;
