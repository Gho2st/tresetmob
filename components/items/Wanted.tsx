import Item from "./Item";
import { products } from "@/lib/products";

export default function Wanted() {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
        {products.map((product) => (
          <Item
            key={product.slug}
            href={`/produkty/${product.slug}`}
            images={product.images}
            title={product.title}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
}
