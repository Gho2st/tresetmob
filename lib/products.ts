import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  Product as PrismaProduct,
  ProductVariant,
} from "@/lib/generated/prisma/client";

export type { ProductVariant };
export type Product = PrismaProduct & { variants: ProductVariant[] };

export function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { variants: true },
  });
}

export function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });
}
