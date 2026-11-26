import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/products";
import { getSizeChart } from "@/lib/size-charts";
import PriceTag from "@/components/PriceTag";
import AddToCart from "@/components/AddToCart";
import Gallery from "@/components/product/Gallery";
import { productImages } from "@/lib/product-images";

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
    // Na telefonie galeria idzie od krawędzi do krawędzi (jak w dużych sklepach
    // odzieżowych), a padding ma dopiero kolumna z opisem.
    <main className="mx-auto grid max-w-6xl gap-6 pb-12 md:grid-cols-2 md:gap-10 md:px-6 md:py-12">
      <Gallery images={productImages(product)} title={product.title} />

      <div className="px-6 md:sticky md:top-8 md:h-fit md:px-0 md:pt-8">
        <h1 className="font-display text-4xl uppercase tracking-tight sm:text-5xl">
          {product.title}
        </h1>
        <PriceTag
          priceCents={product.priceCents}
          salePriceCents={product.salePriceCents}
          lowestPriceCents={product.lowestPriceCents}
          className="mt-3 block text-base"
        />
        <p className="mt-6 text-sm leading-relaxed text-neutral-600">
          {product.description}
        </p>
        <AddToCart product={product} sizeChart={sizeChart} />
      </div>
    </main>
  );
}
