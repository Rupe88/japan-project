-- CreateTable
CREATE TABLE `individual_kyc` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `pronouns` VARCHAR(191) NULL,
    `date_of_birth` DATETIME(3) NOT NULL,
    `national_id` VARCHAR(191) NOT NULL,
    `passport_number` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'Nepal',
    `province` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `municipality` VARCHAR(191) NOT NULL,
    `ward` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `emergency_contact` VARCHAR(191) NULL,
    `profile_photo_url` VARCHAR(191) NULL,
    `video_kyc_url` VARCHAR(191) NULL,
    `highest_qualification` VARCHAR(191) NOT NULL,
    `field_of_study` VARCHAR(191) NOT NULL,
    `school_university` VARCHAR(191) NULL,
    `languages_known` JSON NOT NULL,
    `external_certifications` JSON NULL,
    `employment_status` VARCHAR(191) NOT NULL,
    `experience` JSON NULL,
    `expected_salary_min` INTEGER NULL,
    `expected_salary_max` INTEGER NULL,
    `willing_relocate` BOOLEAN NOT NULL DEFAULT false,
    `technical_skills` JSON NULL,
    `soft_skills` JSON NULL,
    `physical_skills` JSON NULL,
    `interest_domains` JSON NULL,
    `work_style_prefs` JSON NULL,
    `psychometric_data` JSON NULL,
    `motivation_triggers` JSON NULL,
    `learning_prefs` JSON NULL,
    `training_willingness` INTEGER NULL,
    `available_hours_week` INTEGER NULL,
    `career_goals` TEXT NULL,
    `areas_improvement` JSON NULL,
    `digital_literacy` VARCHAR(191) NULL,
    `preferred_industry` VARCHAR(191) NULL,
    `references` JSON NULL,
    `portfolio_urls` JSON NULL,
    `video_intro_url` VARCHAR(191) NULL,
    `social_media_urls` JSON NULL,
    `talent_confidence_score` DOUBLE NULL,
    `career_fit_score` DOUBLE NULL,
    `readiness_score` DOUBLE NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'RESUBMITTED') NOT NULL DEFAULT 'PENDING',
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verified_at` DATETIME(3) NULL,
    `verified_by` VARCHAR(191) NULL,
    `rejection_reason` TEXT NULL,
    `admin_notes` TEXT NULL,
    `consent_given` BOOLEAN NOT NULL DEFAULT false,
    `consent_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `individual_kyc_user_id_key`(`user_id`),
    INDEX `individual_kyc_user_id_idx`(`user_id`),
    INDEX `individual_kyc_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `industrial_kyc` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(191) NOT NULL,
    `company_email` VARCHAR(191) NOT NULL,
    `company_phone` VARCHAR(191) NOT NULL,
    `registration_number` VARCHAR(191) NULL,
    `years_in_business` INTEGER NULL,
    `company_size` VARCHAR(191) NULL,
    `industry_sector` VARCHAR(191) NULL,
    `registration_certificate` VARCHAR(191) NOT NULL,
    `tax_clearance_certificate` VARCHAR(191) NOT NULL,
    `pan_certificate` VARCHAR(191) NOT NULL,
    `vat_certificate` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'Nepal',
    `province` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `municipality` VARCHAR(191) NOT NULL,
    `ward` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NULL,
    `contact_person_name` VARCHAR(191) NULL,
    `contact_person_designation` VARCHAR(191) NULL,
    `contact_person_phone` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'RESUBMITTED') NOT NULL DEFAULT 'PENDING',
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verified_at` DATETIME(3) NULL,
    `verified_by` VARCHAR(191) NULL,
    `rejection_reason` TEXT NULL,
    `admin_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `industrial_kyc_user_id_key`(`user_id`),
    INDEX `industrial_kyc_user_id_idx`(`user_id`),
    INDEX `industrial_kyc_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_courses` (
    `id` VARCHAR(191) NOT NULL,
    `provider_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `duration` INTEGER NOT NULL,
    `mode` ENUM('PHYSICAL', 'ONLINE', 'HYBRID') NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `is_free` BOOLEAN NOT NULL DEFAULT false,
    `syllabus` JSON NULL,
    `prerequisites` JSON NULL,
    `learning_outcomes` JSON NULL,
    `reading_materials` JSON NULL,
    `video_materials` JSON NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `seats` INTEGER NULL,
    `booked_seats` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `verified_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `training_courses_provider_id_idx`(`provider_id`),
    INDEX `training_courses_category_idx`(`category`),
    INDEX `training_courses_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_enrollments` (
    `id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `enrolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ENROLLED',
    `practice_hours` INTEGER NOT NULL DEFAULT 0,
    `practice_videos` JSON NULL,
    `practice_photos` JSON NULL,

    INDEX `training_enrollments_user_id_idx`(`user_id`),
    INDEX `training_enrollments_status_idx`(`status`),
    UNIQUE INDEX `training_enrollments_course_id_user_id_key`(`course_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `training_requests` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `requested_domain` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `interested_count` INTEGER NOT NULL DEFAULT 1,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `admin_response` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `training_requests_user_id_idx`(`user_id`),
    INDEX `training_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(191) NOT NULL,
    `organizer_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('WEBINAR', 'SEMINAR', 'WORKSHOP', 'VIRTUAL_CONFERENCE') NOT NULL,
    `mode` ENUM('PHYSICAL', 'ONLINE', 'HYBRID') NOT NULL,
    `is_free` BOOLEAN NOT NULL DEFAULT true,
    `price` DECIMAL(10, 2) NULL,
    `event_date` DATETIME(3) NOT NULL,
    `duration` INTEGER NOT NULL,
    `meeting_link` VARCHAR(191) NULL,
    `venue` VARCHAR(191) NULL,
    `max_attendees` INTEGER NULL,
    `registered_count` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `events_organizer_id_idx`(`organizer_id`),
    INDEX `events_type_idx`(`type`),
    INDEX `events_event_date_idx`(`event_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_registrations` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `registered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `attended` BOOLEAN NOT NULL DEFAULT false,

    INDEX `event_registrations_user_id_idx`(`user_id`),
    UNIQUE INDEX `event_registrations_event_id_user_id_key`(`event_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exams` (
    `id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `mode` ENUM('PHYSICAL', 'ONLINE', 'HYBRID') NOT NULL,
    `duration` INTEGER NOT NULL,
    `passing_score` INTEGER NOT NULL,
    `total_marks` INTEGER NOT NULL,
    `exam_fee` DECIMAL(10, 2) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `exams_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_bookings` (
    `id` VARCHAR(191) NOT NULL,
    `exam_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `booked_date` DATETIME(3) NOT NULL,
    `exam_date` DATETIME(3) NOT NULL,
    `interview_date` DATETIME(3) NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'PASSED', 'FAILED', 'RETOTALING_REQUESTED', 'RETOTALING_COMPLETED') NOT NULL DEFAULT 'SCHEDULED',
    `score` INTEGER NULL,
    `result_date` DATETIME(3) NULL,
    `retotaling_requested` BOOLEAN NOT NULL DEFAULT false,
    `retotaling_date` DATETIME(3) NULL,
    `retotaling_score` INTEGER NULL,
    `exam_videos` JSON NULL,
    `exam_photos` JSON NULL,
    `interview_videos` JSON NULL,
    `interview_photos` JSON NULL,

    INDEX `exam_bookings_user_id_idx`(`user_id`),
    INDEX `exam_bookings_status_idx`(`status`),
    INDEX `exam_bookings_exam_date_idx`(`exam_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `exam_booking_id` VARCHAR(191) NULL,
    `certificate_number` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `issued_date` DATETIME(3) NOT NULL,
    `expiry_date` DATETIME(3) NULL,
    `certificate_url` VARCHAR(191) NOT NULL,
    `verification_code` VARCHAR(191) NOT NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT true,
    `verified_by` VARCHAR(191) NULL,
    `practice_videos` JSON NULL,
    `practice_photos` JSON NULL,
    `orientation_videos` JSON NULL,
    `orientation_photos` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `certifications_certificate_number_key`(`certificate_number`),
    UNIQUE INDEX `certifications_verification_code_key`(`verification_code`),
    INDEX `certifications_user_id_idx`(`user_id`),
    INDEX `certifications_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_postings` (
    `id` VARCHAR(191) NOT NULL,
    `employer_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `requirements` TEXT NOT NULL,
    `responsibilities` TEXT NULL,
    `job_type` ENUM('INTERNSHIP', 'PART_TIME', 'HOURLY_PAY', 'DAILY_PAY', 'FULL_TIME_1YEAR', 'FULL_TIME_2YEAR', 'FULL_TIME_2YEAR_PLUS') NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'Nepal',
    `province` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `is_remote` BOOLEAN NOT NULL DEFAULT false,
    `salary_min` INTEGER NULL,
    `salary_max` INTEGER NULL,
    `salary_type` VARCHAR(191) NULL,
    `contract_duration` INTEGER NULL,
    `required_skills` JSON NOT NULL,
    `experience_years` INTEGER NULL,
    `education_level` VARCHAR(191) NULL,
    `total_positions` INTEGER NOT NULL DEFAULT 1,
    `filled_positions` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `verified_by` VARCHAR(191) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `job_postings_employer_id_idx`(`employer_id`),
    INDEX `job_postings_job_type_idx`(`job_type`),
    INDEX `job_postings_province_idx`(`province`),
    INDEX `job_postings_district_idx`(`district`),
    INDEX `job_postings_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_applications` (
    `id` VARCHAR(191) NOT NULL,
    `job_id` VARCHAR(191) NOT NULL,
    `applicant_id` VARCHAR(191) NOT NULL,
    `cover_letter` TEXT NULL,
    `resume_url` VARCHAR(191) NOT NULL,
    `portfolio_url` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `interview_date` DATETIME(3) NULL,
    `interview_notes` TEXT NULL,
    `applied_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_at` DATETIME(3) NULL,

    INDEX `job_applications_applicant_id_idx`(`applicant_id`),
    INDEX `job_applications_status_idx`(`status`),
    UNIQUE INDEX `job_applications_job_id_applicant_id_key`(`job_id`, `applicant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employment_history` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `job_application_id` VARCHAR(191) NULL,
    `company_name` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `employment_status` ENUM('INTERNSHIP', 'PART_TIME', 'HOURLY_PAY', 'PROBATION', 'FULLY_EMPLOYED', 'LOOKING_CHANGE', 'LOOKING_NEW', 'PARTNERSHIP_SEEKING', 'PARTNERSHIP_AND_JOB') NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `contract_duration` INTEGER NULL,
    `salary` DECIMAL(10, 2) NULL,
    `salary_type` VARCHAR(191) NULL,
    `is_current` BOOLEAN NOT NULL DEFAULT true,
    `description` TEXT NULL,
    `reason_leaving` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `employment_history_user_id_idx`(`user_id`),
    INDEX `employment_history_is_current_idx`(`is_current`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orientations` (
    `id` VARCHAR(191) NOT NULL,
    `job_application_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `company_id` VARCHAR(191) NOT NULL,
    `scheduled_date` DATETIME(3) NOT NULL,
    `completed_date` DATETIME(3) NULL,
    `venue` VARCHAR(191) NULL,
    `meeting_link` VARCHAR(191) NULL,
    `orientation_videos` JSON NULL,
    `orientation_photos` JSON NULL,
    `notes` TEXT NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `orientations_user_id_idx`(`user_id`),
    INDEX `orientations_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_coins` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_earned` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_spent` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_withdrawn` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `platform_coins_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coin_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `source` VARCHAR(191) NULL,
    `source_id` VARCHAR(191) NULL,
    `recipient_id` VARCHAR(191) NULL,
    `description` VARCHAR(191) NOT NULL,
    `balance_before` DECIMAL(15, 2) NOT NULL,
    `balance_after` DECIMAL(15, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `coin_transactions_user_id_idx`(`user_id`),
    INDEX `coin_transactions_type_idx`(`type`),
    INDEX `coin_transactions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trending_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `job_title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `demand_score` INTEGER NOT NULL,
    `total_openings` INTEGER NOT NULL,
    `avg_salary` DECIMAL(10, 2) NULL,
    `province` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `trending_jobs_demand_score_idx`(`demand_score`),
    INDEX `trending_jobs_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trending_skills` (
    `id` VARCHAR(191) NOT NULL,
    `skill_name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `demand_score` INTEGER NOT NULL,
    `related_jobs` INTEGER NOT NULL,
    `avg_salary_impact` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `trending_skills_demand_score_idx`(`demand_score`),
    INDEX `trending_skills_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `training_enrollments` ADD CONSTRAINT `training_enrollments_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `training_courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `training_enrollments` ADD CONSTRAINT `training_enrollments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `individual_kyc`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_bookings` ADD CONSTRAINT `exam_bookings_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_bookings` ADD CONSTRAINT `exam_bookings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `individual_kyc`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certifications` ADD CONSTRAINT `certifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `individual_kyc`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_postings` ADD CONSTRAINT `job_postings_employer_id_fkey` FOREIGN KEY (`employer_id`) REFERENCES `industrial_kyc`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_job_id_fkey` FOREIGN KEY (`job_id`) REFERENCES `job_postings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_applicant_id_fkey` FOREIGN KEY (`applicant_id`) REFERENCES `individual_kyc`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employment_history` ADD CONSTRAINT `employment_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `individual_kyc`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coin_transactions` ADD CONSTRAINT `coin_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `platform_coins`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
