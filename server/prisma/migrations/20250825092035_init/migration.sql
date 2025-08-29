-- CreateTable
CREATE TABLE `Training` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NULL,
    `openAt` DATETIME(3) NULL,
    `maxParticipants` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrainingsSignup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `trainingId` INTEGER NOT NULL,
    `status` ENUM('pending', 'open', 'confirmed') NOT NULL DEFAULT 'pending',
    `signedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Training` ADD CONSTRAINT `Training_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingsSignup` ADD CONSTRAINT `TrainingsSignup_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrainingsSignup` ADD CONSTRAINT `TrainingsSignup_trainingId_fkey` FOREIGN KEY (`trainingId`) REFERENCES `Training`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
