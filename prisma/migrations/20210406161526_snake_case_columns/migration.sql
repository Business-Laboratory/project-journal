/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `lastEdited` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `summaries` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `updates` table. All the data in the column will be lost.
  - You are about to drop the column `lastEdited` on the `updates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `employees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[project_id]` on the table `summaries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_id` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_clientId_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_userId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_clientId_fkey";

-- DropForeignKey
ALTER TABLE "summaries" DROP CONSTRAINT "summaries_projectId_fkey";

-- DropForeignKey
ALTER TABLE "updates" DROP CONSTRAINT "updates_projectId_fkey";

-- DropIndex
DROP INDEX "employees_userId_unique";

-- DropIndex
DROP INDEX "summaries_projectId_unique";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "logoUrl",
DROP COLUMN "createdAt",
DROP COLUMN "lastEdited",
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "clientId",
DROP COLUMN "userId",
ADD COLUMN     "client_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "clientId",
DROP COLUMN "imageUrl",
ADD COLUMN     "client_id" INTEGER,
ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "summaries" DROP COLUMN "projectId",
ADD COLUMN     "project_id" INTEGER;

-- AlterTable
ALTER TABLE "updates" DROP COLUMN "projectId",
DROP COLUMN "lastEdited",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "project_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_unique" ON "employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "summaries_project_id_unique" ON "summaries"("project_id");

-- AddForeignKey
ALTER TABLE "employees" ADD FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summaries" ADD FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "updates" ADD FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
