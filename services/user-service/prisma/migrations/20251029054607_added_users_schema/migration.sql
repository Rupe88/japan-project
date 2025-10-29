/*
  Warnings:

  - Added the required column `user_type` to the `user_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user_profiles` ADD COLUMN `address_line` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NOT NULL DEFAULT 'Nepal',
    ADD COLUMN `district` VARCHAR(191) NULL,
    ADD COLUMN `postal_code` VARCHAR(191) NULL,
    ADD COLUMN `province` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'SUSPENDED', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `user_type` ENUM('INDIVIDUAL', 'GOVERNMENT_ORG', 'NONPROFIT_ORG', 'PRODUCTION_COMPANY', 'SERVICE_COMPANY', 'TRADING_COMPANY') NOT NULL,
    MODIFY `bio` TEXT NULL;

-- CreateTable
CREATE TABLE `platform_access` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `platform` ENUM('PRODUCT_MARKETPLACE', 'SERVICE_MARKETPLACE', 'TENDER_SYSTEM', 'HR_PLATFORM') NOT NULL,
    `role` ENUM('BUYER', 'SELLER', 'PROVIDER', 'CLIENT', 'BIDDER', 'ISSUER', 'APPLICANT', 'EMPLOYER', 'BOTH') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `kyc_completed` BOOLEAN NOT NULL DEFAULT false,
    `kyc_submitted_at` DATETIME(3) NULL,
    `total_listings` INTEGER NOT NULL DEFAULT 0,
    `total_purchases` INTEGER NOT NULL DEFAULT 0,
    `total_applications` INTEGER NOT NULL DEFAULT 0,
    `total_bids` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `platform_access_user_id_idx`(`user_id`),
    INDEX `platform_access_platform_idx`(`platform`),
    UNIQUE INDEX `platform_access_user_id_platform_key`(`user_id`, `platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `platform_access` ADD CONSTRAINT `platform_access_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
