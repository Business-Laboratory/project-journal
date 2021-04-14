-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "log_storage_blob_url" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "image_storage_blob_url" TEXT;
