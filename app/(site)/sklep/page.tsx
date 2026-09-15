import ProductGrid from "@/components/items/ProductGrid";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import { getProducts } from "@/lib/products";
import {
  availableSizes,
  filterAndSortProducts,
  parseCatalogParams,
} from "@/lib/catalog";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Sklep({ searchParams }: Props) {
  const params = parseCatalogParams(await searchParams);
  const products = await getProducts();
  const filtered = filterAndSortProducts(products, params);

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 py-16 text-black sm:px-12 lg:px-20 lg:py-20 2xl:max-w-[1900px]">
      <div className="mb-10 flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">KOLEKCJE</span>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-bebas text-5xl uppercase tracking-tight sm:text-6xl">
            {params.q ? `Wyniki dla „${params.q}”` : "Wszystkie produkty"}
          </h1>
          <span className="text-sm text-black/40">
            {filtered.length} produktów
          </span>
        </div>
      </div>

      <CatalogFilters sizes={availableSizes(products)} params={params}>
        <ProductGrid products={filtered} />
      </CatalogFilters>
    </section>
  );
}
