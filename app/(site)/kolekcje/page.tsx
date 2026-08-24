import ProductGrid from "@/components/items/ProductGrid";
import { getProducts } from "@/lib/products";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function Kolekcje({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase();

  const products = await getProducts();
  const filtered = query
    ? products.filter((p) => p.title.toLowerCase().includes(query))
    : products;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 py-16 text-black sm:px-12 lg:px-20 lg:py-20">
      <div className="mb-12 flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">
          KOLEKCJE
        </span>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-bebas text-5xl uppercase tracking-tight sm:text-6xl">
            {query ? `Wyniki dla „${q}”` : "Wszystkie produkty"}
          </h1>
          <span className="text-sm text-black/40">
            {filtered.length} produktów
          </span>
        </div>
      </div>

      <ProductGrid products={filtered} />
    </section>
  );
}
