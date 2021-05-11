/*
  Warnings:

  - A unique constraint covering the columns `[client_id,user_id]` on the table `employees` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "employees.client_id_user_id_unique" ON "employees"("client_id", "user_id");
