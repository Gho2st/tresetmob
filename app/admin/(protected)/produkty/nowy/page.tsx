import ProductForm from "@/components/admin/ProductForm";
import { getSizeChartOptions } from "@/lib/size-charts";
import { createProduct } from "../actions";

export default async function NowyProdukt() {
  const sizeCharts = await getSizeChartOptions();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bebas text-4xl uppercase tracking-tight">
        Nowy produkt
      </h1>
      <ProductForm action={createProduct} sizeCharts={sizeCharts} />
    </div>
  );
}
