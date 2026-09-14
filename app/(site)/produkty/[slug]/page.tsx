import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/products";
import { getSizeChart } from "@/lib/size-charts";
import PriceTag from "@/components/PriceTag";
import AddToCart from "@/components/AddToCart";
import Gallery from "@/components/product/Gallery";

export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Nie znaleziono produktu" };

  return {
    title: product.title,
    description: product.description,
    openGraph: { images: product.images },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const sizeChart = product.sizeChartId
    ? await getSizeChart(product.sizeChartId)
    : null;

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
      <Gallery images={product.images} title={product.title} />

      <div className="md:sticky md:top-8 md:h-fit md:pt-8">
        {" "}
        <h1 className="text-sm font-semibold tracking-wide uppercase">
          {product.title}
        </h1>
        <PriceTag
          priceCents={product.priceCents}
          salePriceCents={product.salePriceCents}
          className="mt-3 block text-sm"
        />
        <p className="mt-8 text-sm leading-relaxed text-neutral-600">
          {product.description}
        </p>
        <AddToCart product={product} sizeChart={sizeChart} />
      </div>
    </main>
  );
}
