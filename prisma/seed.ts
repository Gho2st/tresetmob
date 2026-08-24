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
  // Kolejna partia — placeholdery na dev/testy, zdjęcia powtórzone z folderów
  // 1-4 (brak dodatkowych realnych zdjęć w public/items).
  {
    slug: "hoodie-oversize-grey",
    title: "OVERSIZE HOODIE - HEATHER GREY",
    priceCents: 25900,
    salePriceCents: null,
    images: ["/items/2/1.webp", "/items/2/2.webp"],
    description:
      "Luźna bluza oversize z grubej bawełny czesankowej. Kaptur z regulacją, kieszeń typu kangur.",
    variants: [
      { size: "S", stock: 5 },
      { size: "M", stock: 9 },
      { size: "L", stock: 6 },
      { size: "XL", stock: 2 },
    ],
  },
  {
    slug: "cargo-pants-khaki",
    title: "CARGO PANTS - KHAKI",
    priceCents: 32900,
    salePriceCents: 27900,
    images: ["/items/3/1.webp", "/items/3/2.webp"],
    description:
      "Spodnie cargo z bocznymi kieszeniami w kolorze khaki. Luźny krój, ściągacze przy kostce.",
    variants: [
      { size: "28", stock: 3 },
      { size: "30", stock: 7 },
      { size: "32", stock: 5 },
      { size: "34", stock: 0 },
    ],
  },
  {
    slug: "tee-basic-white",
    title: "BASIC TEE - WHITE",
    priceCents: 12900,
    salePriceCents: null,
    images: ["/items/4/1.webp", "/items/4/2.webp"],
    description:
      "Klasyczny t-shirt z ciężkiej, gramaturowej bawełny. Prosty krój, bez nadruku.",
    variants: [
      { size: "S", stock: 10 },
      { size: "M", stock: 12 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 4 },
    ],
  },
  {
    slug: "bomber-jacket-black",
    title: "BOMBER JACKET - BLACK",
    priceCents: 45900,
    salePriceCents: 39900,
    images: ["/items/1/1.png", "/items/1/2.webp"],
    description:
      "Kurtka bomberka w kolorze czarnym. Ściągacze przy mankietach i dole, zamek błyskawiczny.",
    variants: [
      { size: "S", stock: 2 },
      { size: "M", stock: 5 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 1 },
    ],
  },
  {
    slug: "track-pants-black-stripe",
    title: "TRACK PANTS - BLACK STRIPE",
    priceCents: 28900,
    salePriceCents: null,
    images: ["/items/2/1.webp", "/items/2/2.webp"],
    description:
      "Spodnie dresowe z lampasem po bokach. Elastyczny pas, proste nogawki.",
    variants: [
      { size: "28", stock: 6 },
      { size: "30", stock: 6 },
      { size: "32", stock: 6 },
      { size: "34", stock: 3 },
    ],
  },
  {
    slug: "denim-shorts-black-wash",
    title: "DENIM SHORTS - BLACK WASH",
    priceCents: 19900,
    salePriceCents: null,
    images: ["/items/3/1.webp", "/items/3/2.webp"],
    description:
      "Jeansowe szorty w czarnym, sprane wykończeniu. Klasyczny, prosty krój.",
    variants: [
      { size: "28", stock: 4 },
      { size: "30", stock: 5 },
      { size: "32", stock: 3 },
      { size: "34", stock: 0 },
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
