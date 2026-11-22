import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { getSizeChartOptions } from "@/lib/size-charts";
import { sortBySize } from "@/lib/sizes";
import { updateProduct } from "../actions";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

type Params = { params: Promise<{ id: string }> };

export default async function EditProdukt({ params }: Params) {
  const { id } = await params;
  const [product, sizeCharts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    }),
    getSizeChartOptions(),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Edytuj produkt"
        description={product.title}
        back={{ href: "/admin/produkty", label: "Produkty" }}
      />
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        product={{ ...product, variants: sortBySize(product.variants) }}
        sizeCharts={sizeCharts}
      />
    </div>
  );
}
