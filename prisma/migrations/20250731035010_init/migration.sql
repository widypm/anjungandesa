/*
  Warnings:

  - A unique constraint covering the columns `[menuId,type]` on the table `Media` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Media_menuId_type_key` ON `Media`(`menuId`, `type`);
