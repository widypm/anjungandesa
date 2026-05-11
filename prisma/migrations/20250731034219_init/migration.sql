/*
  Warnings:

  - You are about to drop the column `mediaId` on the `Menu` table. All the data in the column will be lost.
  - Added the required column `menuId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Menu` DROP FOREIGN KEY `Menu_mediaId_fkey`;

-- DropIndex
DROP INDEX `Menu_mediaId_fkey` ON `Menu`;

-- AlterTable
ALTER TABLE `Media` ADD COLUMN `menuId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Menu` DROP COLUMN `mediaId`;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
