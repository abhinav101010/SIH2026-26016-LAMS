-- Init migration for MySQL
-- Based on schema.prisma

-- -----------------------------------------------------
-- Table `departments`
-- -----------------------------------------------------
CREATE TABLE `departments` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `departments_name_key`(`name`),
    UNIQUE INDEX `departments_code_key`(`code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN','PROPOSAL_OFFICER','REVIEWING_AUTHORITY','FIELD_OFFICER') NOT NULL DEFAULT 'PROPOSAL_OFFICER',
    `departmentId` VARCHAR(36) NULL,
    `department` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NULL,
    `joinedDate` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLogin` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_employeeId_key`(`employeeId`),
    INDEX `users_departmentId_idx`(`departmentId`),
    CONSTRAINT `users_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `roles`
-- -----------------------------------------------------
CREATE TABLE `roles` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isSystemRole` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `roles_name_key`(`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `permissions`
-- -----------------------------------------------------
CREATE TABLE `permissions` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `permissions_name_key`(`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `role_permissions`
-- -----------------------------------------------------
CREATE TABLE `role_permissions` (
    `id` VARCHAR(36) NOT NULL,
    `appRoleId` VARCHAR(36) NULL,
    `role` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `role_permissions_role_permissionId_key`(`role`, `permissionId`),
    INDEX `role_permissions_permissionId_idx`(`permissionId`),
    INDEX `role_permissions_appRoleId_idx`(`appRoleId`),
    CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `role_permissions_appRoleId_fkey` FOREIGN KEY (`appRoleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `projects`
-- -----------------------------------------------------
CREATE TABLE `projects` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `districts` JSON NULL,
    `department` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `expectedCompletion` DATETIME(3) NULL,
    `totalLength` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ongoing',
    `budget` DOUBLE NULL,
    `center` JSON NULL,
    `zoom` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `proposals`
-- -----------------------------------------------------
CREATE TABLE `proposals` (
    `id` VARCHAR(36) NOT NULL,
    `proposalNumber` VARCHAR(191) NOT NULL,
    `projectName` VARCHAR(191) NOT NULL,
    `projectType` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `ministry` VARCHAR(191) NULL,
    `state` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NOT NULL,
    `purpose` TEXT NOT NULL,
    `estimatedCost` DOUBLE NOT NULL,
    `totalLandRequired` DOUBLE NOT NULL,
    `numberOfParcels` INT NOT NULL,
    `landType` VARCHAR(191) NOT NULL,
    `affectedFamilies` INT NULL,
    `affectedArea` VARCHAR(191) NULL,
    `affectedAreaType` VARCHAR(191) NULL,
    `affectedAreaKm2` DOUBLE NULL,
    `estimatedPopulation` INT NULL,
    `populationDensity` DOUBLE NULL,
    `populationDataSource` VARCHAR(191) NULL,
    `displacedFamilies` INT NULL,
    `status` ENUM('DRAFT','SUBMITTED','FIELD_VERIFICATION','UNDER_REVIEW','APPROVED','REJECTED','CHANGES_REQUESTED','NOTIFICATION_ISSUED','AWARD_DECLARED','COMPENSATION','ACQUIRED','POSSESSION') NOT NULL DEFAULT 'DRAFT',
    `priority` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `currentStage` VARCHAR(191) NULL,
    `progress` INT NOT NULL DEFAULT 0,
    `submittedBy` VARCHAR(191) NULL,
    `submittedDate` DATETIME(3) NULL,
    `targetCompletion` DATETIME(3) NULL,
    `departmentId` VARCHAR(36) NULL,
    `createdById` VARCHAR(36) NULL,
    `updatedById` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `proposals_proposalNumber_key`(`proposalNumber`),
    INDEX `proposals_departmentId_idx`(`departmentId`),
    INDEX `proposals_createdById_idx`(`createdById`),
    INDEX `proposals_updatedById_idx`(`updatedById`),
    INDEX `proposals_status_idx`(`status`),
    CONSTRAINT `proposals_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `proposals_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `proposals_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `land_parcels`
-- -----------------------------------------------------
CREATE TABLE `land_parcels` (
    `id` VARCHAR(36) NOT NULL,
    `proposalId` VARCHAR(36) NOT NULL,
    `parcelNumber` VARCHAR(191) NOT NULL,
    `area` DOUBLE NOT NULL,
    `landType` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `surveyNo` VARCHAR(191) NULL,
    `village` VARCHAR(191) NULL,
    `owner` VARCHAR(191) NULL,
    `geometry` TEXT NULL,
    `acquiredDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `land_parcels_proposalId_idx`(`proposalId`),
    CONSTRAINT `land_parcels_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `approvals`
-- -----------------------------------------------------
CREATE TABLE `approvals` (
    `id` VARCHAR(36) NOT NULL,
    `proposalId` VARCHAR(36) NOT NULL,
    `reviewerId` VARCHAR(36) NOT NULL,
    `action` ENUM('APPROVED','REJECTED','CHANGES_REQUESTED') NOT NULL,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `approvals_proposalId_idx`(`proposalId`),
    INDEX `approvals_reviewerId_idx`(`reviewerId`),
    CONSTRAINT `approvals_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `approvals_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `documents`
-- -----------------------------------------------------
CREATE TABLE `documents` (
    `id` VARCHAR(36) NOT NULL,
    `proposalId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileSize` INT NOT NULL,
    `storagePath` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL DEFAULT '1.0',
    `uploadedById` VARCHAR(36) NOT NULL,
    `verificationStatus` ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
    `verifiedById` VARCHAR(36) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `verificationRemarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `documents_proposalId_idx`(`proposalId`),
    INDEX `documents_uploadedById_idx`(`uploadedById`),
    INDEX `documents_verifiedById_idx`(`verifiedById`),
    CONSTRAINT `documents_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `documents_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `documents_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `notifications`
-- -----------------------------------------------------
CREATE TABLE `notifications` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `priority` VARCHAR(191) NULL,
    `action` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `unread` BOOLEAN NOT NULL DEFAULT true,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `notifications_userId_idx`(`userId`),
    CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `affected_families`
-- -----------------------------------------------------
CREATE TABLE `affected_families` (
    `id` VARCHAR(36) NOT NULL,
    `proposalId` VARCHAR(36) NOT NULL,
    `headOfFamily` VARCHAR(191) NOT NULL,
    `address` TEXT NULL,
    `landArea` DOUBLE NULL,
    `compensationAmount` DOUBLE NULL,
    `status` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(36) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `affected_families_proposalId_idx`(`proposalId`),
    INDEX `affected_families_createdById_idx`(`createdById`),
    CONSTRAINT `affected_families_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `affected_families_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `rehabilitation_records`
-- -----------------------------------------------------
CREATE TABLE `rehabilitation_records` (
    `id` VARCHAR(36) NOT NULL,
    `affectedFamilyId` VARCHAR(36) NOT NULL,
    `proposalId` VARCHAR(36) NOT NULL,
    `status` ENUM('PENDING','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'PENDING',
    `entitlements` TEXT NULL,
    `completionStatus` VARCHAR(191) NULL,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE INDEX `rehabilitation_records_affectedFamilyId_key`(`affectedFamilyId`),
    INDEX `rehabilitation_records_proposalId_idx`(`proposalId`),
    CONSTRAINT `rehabilitation_records_affectedFamilyId_fkey` FOREIGN KEY (`affectedFamilyId`) REFERENCES `affected_families`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `compensation`
-- -----------------------------------------------------
CREATE TABLE `compensation` (
    `id` VARCHAR(36) NOT NULL,
    `proposalId` VARCHAR(36) NOT NULL,
    `affectedFamilyId` VARCHAR(36) NULL,
    `assessedAmount` DOUBLE NULL,
    `paidAmount` DOUBLE NULL,
    `status` ENUM('ASSESSED','PARTIALLY_PAID','PAID','PENDING') NOT NULL DEFAULT 'PENDING',
    `paymentDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `compensation_proposalId_idx`(`proposalId`),
    INDEX `compensation_affectedFamilyId_idx`(`affectedFamilyId`),
    CONSTRAINT `compensation_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `compensation_affectedFamilyId_fkey` FOREIGN KEY (`affectedFamilyId`) REFERENCES `affected_families`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `possession`
-- -----------------------------------------------------
CREATE TABLE `possession` (
    `id` VARCHAR(36) NOT NULL,
    `proposalId` VARCHAR(36) NOT NULL,
    `parcelId` VARCHAR(36) NOT NULL,
    `status` ENUM('PENDING','PARTIAL','COMPLETED') NOT NULL DEFAULT 'PENDING',
    `possessionDate` DATETIME(3) NULL,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `possession_proposalId_idx`(`proposalId`),
    INDEX `possession_parcelId_idx`(`parcelId`),
    CONSTRAINT `possession_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `possession_parcelId_fkey` FOREIGN KEY (`parcelId`) REFERENCES `land_parcels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `audit_logs`
-- -----------------------------------------------------
CREATE TABLE `audit_logs` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `oldValue` TEXT NULL,
    `newValue` TEXT NULL,
    `metadata` TEXT NULL,
    `departmentId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_departmentId_idx`(`departmentId`),
    CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `audit_logs_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Prisma migrations tracking table
-- -----------------------------------------------------
CREATE TABLE `_prisma_migrations` (
    `id` VARCHAR(36) NOT NULL,
    `checksum` VARCHAR(64) NOT NULL,
    `finished_at` DATETIME(3) NULL,
    `migration_name` VARCHAR(255) NOT NULL,
    `logs` TEXT NULL,
    `rolled_back_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applied_steps_count` INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
