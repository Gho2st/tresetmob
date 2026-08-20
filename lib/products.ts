export type Product = {
  slug: string;
  title: string;
  price: string;
  images: string[]; // [0] główne, [1] hover, reszta do galerii
  description: string;
  sizes: string[];
};

export const products: Product[] = [
  {
    slug: "straight-jeans-all-black-denim",
    title: "STRAIGHT JEANS - ALL BLACK DENIM",
    price: "359,00 zł",
    images: [
      "/items/jeans.png",
      "/items/jeans2.webp",
    ],
    description:
      "Proste jeansy z bawełny w kolorze głębokiej czerni. Średni stan, klasyczny krój.",
    sizes: ["28", "30", "32", "34"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
