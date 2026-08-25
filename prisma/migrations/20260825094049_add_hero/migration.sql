-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "type" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT,
    "poster" TEXT,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);
