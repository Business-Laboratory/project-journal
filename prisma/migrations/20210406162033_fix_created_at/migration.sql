/*
  Warnings:

  - You are about to drop the column `createdAt` on the `updates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "updates" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
