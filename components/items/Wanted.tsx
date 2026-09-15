import ProductGrid from "./ProductGrid";
import { getProducts } from "@/lib/products";

export default async function Wanted() {
  const products = await getProducts();

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-32 sm:px-12 lg:px-20 2xl:max-w-[1900px]">
      <ProductGrid products={products} />
    </div>
  );
}
