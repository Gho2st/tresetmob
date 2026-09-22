import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { getSizeChartOptions } from "@/lib/size-charts";
import { updateProduct } from "../actions";

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
      <h1 className="font-bebas text-3xl tracking-tight uppercase sm:text-4xl">
        Edytuj produkt
      </h1>
      <ProductForm
        action={updateProduct.bind(null, product.id)}
        product={product}
        sizeCharts={sizeCharts}
      />
    </div>
  );
}
