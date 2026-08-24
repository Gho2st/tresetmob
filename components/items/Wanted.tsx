import ProductGrid from "./ProductGrid";
import { getProducts } from "@/lib/products";

export default async function Wanted() {
  const products = await getProducts();

  return (
    <div className="px-4 py-32">
      <ProductGrid products={products} />
    </div>
  );
}
