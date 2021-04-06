/*
  Warnings:

  - You are about to drop the column `body` on the `summaries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "summaries" DROP COLUMN "body",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "roadmap" TEXT;

-- CreateTable
CREATE TABLE "_ProjectToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToUser_AB_unique" ON "_ProjectToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToUser_B_index" ON "_ProjectToUser"("B");

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
