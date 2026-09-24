-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imageAlts" TEXT[] DEFAULT ARRAY[]::TEXT[];
