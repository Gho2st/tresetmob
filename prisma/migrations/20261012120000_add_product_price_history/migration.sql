-- CreateTable
CREATE TABLE "ProductPriceHistory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductPriceHistory_productId_createdAt_idx" ON "ProductPriceHistory"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Punkt startowy historii: obecna cena każdego produktu. Wcześniejszych zmian
-- nikt nie zapisywał, więc nie da się ich odtworzyć.
INSERT INTO "ProductPriceHistory" ("id", "productId", "priceCents", "createdAt")
SELECT md5(random()::text || "id"), "id", COALESCE("salePriceCents", "priceCents"), CURRENT_TIMESTAMP
FROM "Product";
