import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, products } from "@/lib/products";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) return { title: "Nie znaleziono produktu" };

  return {
    title: product.title,
    description: product.description,
    openGraph: { images: product.images },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) notFound();

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        {product.images.map((src, i) => (
          <div key={src} className="relative aspect-3/4 w-full bg-neutral-100">
            <Image
              src={src}
              alt={i === 0 ? product.title : ""}
              fill
              priority={i === 0}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <div className="md:sticky md:top-8 md:h-fit md:pt-8">
        {" "}
        <h1 className="text-sm font-semibold tracking-wide uppercase">
          {product.title}
        </h1>
        <span className="mt-3 block text-sm">{product.price}</span>
        <p className="mt-8 text-sm leading-relaxed text-neutral-600">
          {product.description}
        </p>
        <div className="mt-8">
          <span className="text-xs tracking-wide uppercase">Rozmiar</span>
          <div className="mt-3 flex gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                className="border border-neutral-300 px-4 py-2 text-sm hover:border-black"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <button className="mt-8 w-full bg-black py-4 text-sm tracking-wide text-white uppercase hover:bg-neutral-800">
          Dodaj do koszyka
        </button>
      </div>
    </main>
  );
}
