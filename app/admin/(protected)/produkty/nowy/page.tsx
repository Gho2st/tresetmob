import ProductForm from "@/components/admin/ProductForm";
import { getSizeChartOptions } from "@/lib/size-charts";
import { createProduct } from "../actions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function NowyProdukt() {
  const sizeCharts = await getSizeChartOptions();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Nowy produkt"
        back={{ href: "/admin/produkty", label: "Produkty" }}
      />
      <ProductForm action={createProduct} sizeCharts={sizeCharts} />
    </div>
  );
}
