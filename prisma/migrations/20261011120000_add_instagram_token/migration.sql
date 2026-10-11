-- CreateTable
CREATE TABLE "InstagramToken" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstagramToken_pkey" PRIMARY KEY ("id")
);
