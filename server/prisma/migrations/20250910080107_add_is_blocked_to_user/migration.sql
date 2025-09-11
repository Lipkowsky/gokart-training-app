/*
  Warnings:

  - A unique constraint covering the columns `[userId,trainingId]` on the table `TrainingsSignup` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `TrainingsSignup` DROP FOREIGN KEY `TrainingsSignup_userId_fkey`;

-- DropIndex
DROP INDEX `TrainingsSignup_userId_fkey` ON `TrainingsSignup`;

-- AlterTable
ALTER TABLE `Training` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `TrainingsSignup` ADD COLUMN `createdById` INTEGER NULL,
    ADD COLUMN `guestName` VARCHAR(191) NULL,
    MODIFY `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isBlocked` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `TrainingsSignup_userId_trainingId_key` ON `TrainingsSignup`(`userId`, `trainingId`);

-- AddForeignKey
ALTER TABLE `TrainingsSignup` ADD CONSTRAINT `TrainingsSignup_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingsSignup` ADD CONSTRAINT `TrainingsSignup_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
