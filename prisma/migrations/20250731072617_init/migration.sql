/*
  Warnings:

  - You are about to drop the `MediaTranslation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[menuId,type,langCode]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `langCode` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `MediaTranslation` DROP FOREIGN KEY `MediaTranslation_langCode_fkey`;

-- DropForeignKey
ALTER TABLE `MediaTranslation` DROP FOREIGN KEY `MediaTranslation_mediaId_fkey`;

-- DropIndex
DROP INDEX `Media_menuId_key` ON `Media`;

-- AlterTable
ALTER TABLE `Media` ADD COLUMN `alt` VARCHAR(191) NULL,
    ADD COLUMN `langCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    ADD COLUMN `url` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `MediaTranslation`;

-- CreateIndex
CREATE UNIQUE INDEX `Media_menuId_type_langCode_key` ON `Media`(`menuId`, `type`, `langCode`);

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
