-- AlterTable
ALTER TABLE "Product" ADD COLUMN "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Do czasu ustawienia dat w panelu sortowanie zostaje takie jak dotąd.
UPDATE "Product" SET "releasedAt" = "createdAt";
