/*
  Warnings:

  - You are about to drop the column `lastEditted` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `lastEditted` on the `updates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "lastEditted",
ADD COLUMN     "lastEdited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "updates" DROP COLUMN "lastEditted",
ADD COLUMN     "lastEdited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
