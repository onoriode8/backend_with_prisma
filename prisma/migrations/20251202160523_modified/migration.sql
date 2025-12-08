/*
  Warnings:

  - You are about to drop the `refreshtoken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `refreshtoken` DROP FOREIGN KEY `RefreshToken_creatorId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `refreshToken` VARCHAR(191) NOT NULL DEFAULT '';

-- DropTable
DROP TABLE `refreshtoken`;

-- CreateTable
CREATE TABLE `WhereLogin` (
    `deviceId` INTEGER NOT NULL AUTO_INCREMENT,
    `OSVersion` VARCHAR(191) NOT NULL,
    `device` VARCHAR(191) NOT NULL,
    `browser` VARCHAR(191) NOT NULL,
    `browserVersion` VARCHAR(191) NOT NULL,
    `creatorId` INTEGER NOT NULL,

    PRIMARY KEY (`deviceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WhereLogin` ADD CONSTRAINT `WhereLogin_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
