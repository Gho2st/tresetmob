-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentRef" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'oplacone';
