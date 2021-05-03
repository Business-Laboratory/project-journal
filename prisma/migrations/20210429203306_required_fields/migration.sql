/*
  Warnings:

  - Made the column `project_id` on table `summaries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `project_id` on table `updates` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "summaries" ALTER COLUMN "project_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "updates" ALTER COLUMN "project_id" SET NOT NULL;
