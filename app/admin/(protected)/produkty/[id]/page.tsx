import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "../actions";

type Params = { params: Promise<{ id: string }> };

export default async function EditProdukt({ params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bebas text-4xl uppercase tracking-tight">
        Edytuj produkt
      </h1>
      <ProductForm action={updateProduct.bind(null, product.id)} product={product} />
    </div>
  );
}
