import Item from "./Item";
import type { Product } from "@/lib/products";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-black/50">
        Brak produktów do wyświetlenia.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Item
          key={product.slug}
          href={`/produkty/${product.slug}`}
          images={product.images}
          title={product.title}
          priceCents={product.priceCents}
          salePriceCents={product.salePriceCents}
        />
      ))}
    </div>
  );
}
