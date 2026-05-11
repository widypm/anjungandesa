/*
  Warnings:

  - You are about to drop the column `type` on the `Media` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[menuId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `MediaTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Media` DROP FOREIGN KEY `Media_menuId_fkey`;

-- DropIndex
DROP INDEX `Media_menuId_type_key` ON `Media`;

-- AlterTable
ALTER TABLE `Media` DROP COLUMN `type`;

-- AlterTable
ALTER TABLE `MediaTranslation` ADD COLUMN `type` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Media_menuId_key` ON `Media`(`menuId`);
