import "server-only";
import { prisma } from "@/lib/prisma";
import { lowestPriceBeforeReduction } from "@/lib/price-history";
import { sortBySize } from "@/lib/sizes";
import type {
  Prisma,
  Product as PrismaProduct,
  ProductVariant,
} from "@/lib/generated/prisma/client";

export type { ProductVariant };
export type Product = PrismaProduct & {
  variants: ProductVariant[];
  /** Najniższa cena z 30 dni przed obniżką; null, gdy historia jej nie zna. */
  lowestPriceCents: number | null;
};

const include = {
  variants: true,
  priceHistory: { select: { priceCents: true, createdAt: true } },
} satisfies Prisma.ProductInclude;

type ProductWithHistory = Prisma.ProductGetPayload<{ include: typeof include }>;

// Historię zamieniamy na jedną liczbę od razu tutaj, żeby do komponentów
// (także klienckich) nie leciała cała lista wpisów.
// Tu też układamy rozmiary od najmniejszego — baza oddaje warianty w kolejności
// dodania, a ta w panelu bywa przypadkowa.
function withLowestPrice({ priceHistory, ...product }: ProductWithHistory): Product {
  return {
    ...product,
    variants: sortBySize(product.variants),
    lowestPriceCents: lowestPriceBeforeReduction(priceHistory),
  };
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include,
  });
  return products.map(withLowestPrice);
}

export async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug }, include });
  return product ? withLowestPrice(product) : null;
}
