import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/contact";

// Odświeżana razem z katalogiem — nowy produkt trafia do mapy najpóźniej po godzinie.
export const revalidate = 3600;

const STATIC_PAGES = [
  { path: "", priority: 1 },
  { path: "/sklep", priority: 0.9 },
  { path: "/centrum-pomocy", priority: 0.4 },
  { path: "/zwroty", priority: 0.3 },
  { path: "/regulamin", priority: 0.2 },
  { path: "/polityka-prywatnosci", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  return [
    ...STATIC_PAGES.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      priority,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/produkty/${product.slug}`,
      lastModified: product.updatedAt,
      priority: 0.8,
      images: product.images.slice(0, 1).map((src) => new URL(src, SITE_URL).toString()),
    })),
  ];
}
