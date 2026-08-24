import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Jednorazowy import 4 produktów, które wcześniej żyły w lib/products.ts jako
// statyczny plik. Uruchamiane przez `npm run db:seed` po skonfigurowaniu DIRECT_URL.
const products = [
  {
    slug: "straight-jeans-all-black-denim",
    title: "STRAIGHT JEANS - ALL BLACK DENIM",
    priceCents: 35900,
    salePriceCents: 29900,
    images: ["/items/1/1.png", "/items/1/2.webp"],
    description:
      "Proste jeansy z bawełny w kolorze głębokiej czerni. Średni stan, klasyczny krój.",
    variants: [
      { size: "28", stock: 5 },
      { size: "30", stock: 8 },
      { size: "32", stock: 0 },
      { size: "34", stock: 3 },
    ],
  },
  {
    slug: "bluza",
    title: "STRAIGHT JEANS - ALL BLACK DENIM",
    priceCents: 35900,
    salePriceCents: null,
    images: ["/items/2/1.webp", "/items/2/2.webp"],
    description:
      "Proste jeansy z bawełny w kolorze głębokiej czerni. Średni stan, klasyczny krój.",
    variants: [
      { size: "28", stock: 4 },
      { size: "30", stock: 6 },
      { size: "32", stock: 2 },
      { size: "34", stock: 7 },
    ],
  },
  {
    slug: "bluza-2",
    title: "STRAIGHT JEANS - ALL BLACK DENIM",
    priceCents: 35900,
    salePriceCents: null,
    images: ["/items/3/1.webp", "/items/3/2.webp"],
    description:
      "Proste jeansy z bawełny w kolorze głębokiej czerni. Średni stan, klasyczny krój.",
    variants: [
      { size: "28", stock: 4 },
      { size: "30", stock: 6 },
      { size: "32", stock: 2 },
      { size: "34", stock: 7 },
    ],
  },
  {
    slug: "bluza-3",
    title: "STRAIGHT JEANS - ALL BLACK DENIM",
    priceCents: 35900,
    salePriceCents: null,
    images: ["/items/4/1.webp", "/items/4/2.webp"],
    description:
      "Proste jeansy z bawełny w kolorze głębokiej czerni. Średni stan, klasyczny krój.",
    variants: [
      { size: "28", stock: 4 },
      { size: "30", stock: 6 },
      { size: "32", stock: 2 },
      { size: "34", stock: 7 },
    ],
  },
];

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL! });
  const prisma = new PrismaClient({ adapter });

  for (const { variants, ...product } of products) {
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    await prisma.productVariant.deleteMany({ where: { productId: saved.id } });
    await prisma.productVariant.createMany({
      data: variants.map((v) => ({ ...v, productId: saved.id })),
    });
  }

  console.log(`Zaimportowano ${products.length} produktów.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
