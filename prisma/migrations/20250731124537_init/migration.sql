-- DropForeignKey
ALTER TABLE `MenuTranslation` DROP FOREIGN KEY `MenuTranslation_langCode_fkey`;

-- DropIndex
DROP INDEX `MenuTranslation_langCode_slug_key` ON `MenuTranslation`;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_typeMenuId_fkey` FOREIGN KEY (`typeMenuId`) REFERENCES `MenuType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
