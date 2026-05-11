-- AlterTable
ALTER TABLE `Menu` ADD COLUMN `typeMenuId` INTEGER NULL;

-- CreateTable
CREATE TABLE `MenuType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `MenuType_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_typeMenuId_fkey` FOREIGN KEY (`typeMenuId`) REFERENCES `MenuType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
