// Bez "server-only" — kolejność rozmiarów przydaje się też w komponentach klienckich.

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

// „2XL” i „XXL” to ten sam rozmiar, tylko inaczej zapisany.
const ALIASES: Record<string, string> = { "2XL": "XXL", "3XL": "XXXL" };

function rank(size: string) {
  const normalized = size.trim().toUpperCase();
  return SIZE_ORDER.indexOf(ALIASES[normalized] ?? normalized);
}

/**
 * Od najmniejszego do największego: najpierw rozmiary literowe (XS…XXXL),
 * potem liczbowe (np. 30, 32 w spodniach), na końcu cała reszta alfabetycznie.
 */
export function compareSizes(a: string, b: string) {
  const ia = rank(a);
  const ib = rank(b);
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  if (!Number.isNaN(na)) return -1;
  if (!Number.isNaN(nb)) return 1;
  return a.localeCompare(b, "pl");
}

/** Kopia listy wariantów posortowana po rozmiarze. */
export function sortBySize<T extends { size: string }>(variants: T[]): T[] {
  return [...variants].sort((a, b) => compareSizes(a.size, b.size));
}
