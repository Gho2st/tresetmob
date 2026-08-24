import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../actions";

export default function NowyProdukt() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bebas text-4xl uppercase tracking-tight">
        Nowy produkt
      </h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
