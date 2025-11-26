-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('User', 'Admin', 'Member') NOT NULL DEFAULT 'User';
