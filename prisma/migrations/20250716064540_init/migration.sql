-- CreateTable
CREATE TABLE `Lang` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mediaId` INTEGER NOT NULL,
    `langCode` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,

    UNIQUE INDEX `MediaTranslation_mediaId_langCode_key`(`mediaId`, `langCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Menu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parentId` INTEGER NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `mediaId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MenuTranslation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `menuId` INTEGER NOT NULL,
    `langCode` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `MenuTranslation_langCode_slug_key`(`langCode`, `slug`),
    UNIQUE INDEX `MenuTranslation_menuId_langCode_key`(`menuId`, `langCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaTranslation` ADD CONSTRAINT `MediaTranslation_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaTranslation` ADD CONSTRAINT `MediaTranslation_langCode_fkey` FOREIGN KEY (`langCode`) REFERENCES `Lang`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Menu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuTranslation` ADD CONSTRAINT `MenuTranslation_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuTranslation` ADD CONSTRAINT `MenuTranslation_langCode_fkey` FOREIGN KEY (`langCode`) REFERENCES `Lang`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;
