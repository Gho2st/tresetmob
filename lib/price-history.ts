const DAY_MS = 24 * 60 * 60 * 1000;
const OMNIBUS_WINDOW_MS = 30 * DAY_MS;

type PriceEntry = { priceCents: number; createdAt: Date };

/**
 * Najniższa cena z 30 dni przed obniżką (dyrektywa Omnibus). Obniżka to
 * ostatni wpis tańszy od poprzedniego — późniejsza podwyżka ceny promocyjnej
 * nie jest nową obniżką, więc nie przesuwa okresu odniesienia.
 *
 * Zwraca null, gdy historia nie zna żadnej obniżki (np. produkt od początku
 * wystawiony w promocji) — wtedy jedyną znaną ceną jest ta aktualna.
 */
export function lowestPriceBeforeReduction(history: PriceEntry[]): number | null {
  const entries = [...history].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  let start = -1;
  for (let i = entries.length - 1; i > 0; i--) {
    if (entries[i].priceCents < entries[i - 1].priceCents) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;

  const windowStart = entries[start].createdAt.getTime() - OMNIBUS_WINDOW_MS;
  let lowest = Infinity;

  for (let i = 0; i < start; i++) {
    const next = entries[i + 1].createdAt.getTime();
    // Cena obowiązywała od swojego wpisu do następnego, więc liczy się każda,
    // której okres choć trochę zahacza o 30 dni przed obniżką.
    if (next > windowStart) lowest = Math.min(lowest, entries[i].priceCents);
  }

  return Number.isFinite(lowest) ? lowest : null;
}

export function effectivePriceCents(product: {
  priceCents: number;
  salePriceCents: number | null;
}) {
  return product.salePriceCents ?? product.priceCents;
}
