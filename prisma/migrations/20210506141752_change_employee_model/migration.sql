/*
  Warnings:

  - The primary key for the `employees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `employees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "employees" DROP CONSTRAINT "employees_pkey",
DROP COLUMN "id",
ADD PRIMARY KEY ("client_id", "user_id");

-- AlterIndex
ALTER INDEX "employees.user_id_unique" RENAME TO "employees_user_id_unique";
