-- DropIndex
DROP INDEX `MenuType_slug_key` ON `MenuType`;

-- AlterTable
ALTER TABLE `MenuType` MODIFY `slug` VARCHAR(191) NULL;
