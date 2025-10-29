/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `token` VARCHAR(512) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPhoneVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `last_login` DATETIME(3) NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `verification_codes` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `is_used` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `verification_codes_email_idx`(`email`),
    INDEX `verification_codes_code_idx`(`code`),
    INDEX `verification_codes_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `refresh_tokens_token_idx` ON `refresh_tokens`(`token`(255));

-- CreateIndex
CREATE UNIQUE INDEX `users_phoneNumber_key` ON `users`(`phoneNumber`);

-- AddForeignKey
ALTER TABLE `verification_codes` ADD CONSTRAINT `verification_codes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `refresh_tokens` RENAME INDEX `refresh_tokens_user_id_fkey` TO `refresh_tokens_user_id_idx`;
