-- CreateTable
CREATE TABLE `RefreshToken` (
    `deviceId` INTEGER NOT NULL AUTO_INCREMENT,
    `device` VARCHAR(191) NOT NULL,
    `window` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `refreshToken` VARCHAR(191) NOT NULL,
    `creatorId` INTEGER NOT NULL,

    PRIMARY KEY (`deviceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
