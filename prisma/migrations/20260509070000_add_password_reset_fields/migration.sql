-- AlterTable
ALTER TABLE `User`
  ADD COLUMN `resetTokenHash` VARCHAR(191) NULL,
  ADD COLUMN `resetTokenExpiresAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `User_resetTokenHash_idx` ON `User`(`resetTokenHash`);
