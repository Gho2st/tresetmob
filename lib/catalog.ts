import type { Product } from "@/lib/products";

export const SORT_OPTIONS = [
  { value: "polecane", label: "Polecane" },
  { value: "najnowsze", label: "Najnowsze" },
  { value: "cena-rosnaco", label: "Cena rosnąco" },
  { value: "cena-malejaco", label: "Cena malejąco" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export type CatalogParams = {
  q?: string;
  sort: SortValue;
  sizes: string[];
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;
const all = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

// Stan filtrów żyje w URL-u (?sort=&rozmiar=) — parse/build to para,
// którą trzeba zmieniać razem.
export function parseCatalogParams(raw: RawParams): CatalogParams {
  const sort = first(raw.sort);
  return {
    q: first(raw.q)?.trim() || undefined,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortValue) : "polecane",
    sizes: all(raw.rozmiar).map((s) => s.trim()).filter(Boolean),
  };
}

export function buildCatalogHref(pathname: string, params: CatalogParams) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.sort !== "polecane") search.set("sort", params.sort);
  for (const size of params.sizes) search.append("rozmiar", size);
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

const effectivePrice = (p: Product) => p.salePriceCents ?? p.priceCents;

export function filterAndSortProducts(products: Product[], params: CatalogParams) {
  const query = params.q?.toLowerCase();
  const sizes = new Set(params.sizes.map((s) => s.toLowerCase()));

  const result = products.filter((p) => {
    if (query && !p.title.toLowerCase().includes(query)) return false;
    // wybrany rozmiar musi być faktycznie na stanie, inaczej filtr wprowadzałby w błąd
    if (
      sizes.size > 0 &&
      !p.variants.some((v) => v.stock > 0 && sizes.has(v.size.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  // sort jest stabilny, więc przy remisach zostaje kolejność ustawiona w panelu admina
  switch (params.sort) {
    case "najnowsze":
      return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "cena-rosnaco":
      return result.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case "cena-malejaco":
      return result.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    default:
      return result;
  }
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function compareSizes(a: string, b: string) {
  const ia = SIZE_ORDER.indexOf(a.toUpperCase());
  const ib = SIZE_ORDER.indexOf(b.toUpperCase());
  if (ia !== -1 && ib !== -1) return ia - ib;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return a.localeCompare(b, "pl");
}

/** Rozmiary do filtra — tylko te, które są gdziekolwiek na stanie. */
export function availableSizes(products: Product[]) {
  const sizes = new Set<string>();
  for (const product of products) {
    for (const variant of product.variants) {
      if (variant.stock > 0) sizes.add(variant.size);
    }
  }
  return [...sizes].sort(compareSizes);
}
