import "server-only";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/order-status";
import { compareSizes } from "@/lib/sizes";

const DAY = 24 * 60 * 60 * 1000;
const TIME_ZONE = "Europe/Warsaw";

// Poniżej tylu sztuk wariant trafia na listę „kończy się” w podsumowaniu.
const LOW_STOCK = 2;

export const PERIODS = {
  "7": { label: "7 dni", days: 7 },
  "30": { label: "30 dni", days: 30 },
  "90": { label: "90 dni", days: 90 },
  "365": { label: "12 miesięcy", days: 365 },
  all: { label: "Całość", days: null },
} as const;

export type PeriodKey = keyof typeof PERIODS;

export function isPeriodKey(value: unknown): value is PeriodKey {
  return typeof value === "string" && value in PERIODS;
}

type Totals = {
  revenueCents: number;
  orders: number;
  avgCents: number;
  units: number;
  discountCents: number;
};

export type Bucket = { label: string; title: string; cents: number; orders: number };

type OrderWithItems = Awaited<ReturnType<typeof fetchOrders>>[number];

function fetchOrders(from: Date | null) {
  return prisma.order.findMany({
    where: from ? { createdAt: { gte: from } } : undefined,
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Do przychodu liczymy tylko zamówienia faktycznie opłacone i nieanulowane —
 * „oczekuje” może jeszcze nie dojść, a anulowane pieniądze wracają do klienta.
 */
function counts(order: OrderWithItems) {
  return order.paymentStatus === "oplacone" && order.status !== "anulowane";
}

function totals(orders: OrderWithItems[]): Totals {
  const counted = orders.filter(counts);
  const revenueCents = counted.reduce((sum, o) => sum + o.totalCents, 0);
  return {
    revenueCents,
    orders: counted.length,
    avgCents: counted.length ? Math.round(revenueCents / counted.length) : 0,
    units: counted.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0,
    ),
    discountCents: counted.reduce((sum, o) => sum + o.discountCents, 0),
  };
}

const dayKey = (date: Date) =>
  date.toLocaleDateString("sv-SE", { timeZone: TIME_ZONE }); // 2026-10-23
const monthKey = (date: Date) => dayKey(date).slice(0, 7); // 2026-10

const shortDate = (date: Date) =>
  date.toLocaleDateString("pl-PL", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "numeric",
  });
const longDate = (date: Date) =>
  date.toLocaleDateString("pl-PL", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * Słupki wykresu: dzień po dniu do miesiąca, tygodnie dla kwartału, dalej
 * miesiące — tak, żeby słupków było kilkanaście–kilkadziesiąt, nie kilkaset.
 */
function buildSeries(
  orders: OrderWithItems[],
  from: Date,
  now: Date,
  days: number,
): Bucket[] {
  const counted = orders.filter(counts);

  if (days <= 31) {
    const buckets = new Map<string, Bucket>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * DAY);
      buckets.set(dayKey(date), {
        label: shortDate(date),
        title: longDate(date),
        cents: 0,
        orders: 0,
      });
    }
    for (const order of counted) {
      const bucket = buckets.get(dayKey(order.createdAt));
      if (bucket) {
        bucket.cents += order.totalCents;
        bucket.orders += 1;
      }
    }
    return [...buckets.values()];
  }

  if (days <= 120) {
    const count = Math.ceil(days / 7);
    const buckets: Bucket[] = Array.from({ length: count }, (_, i) => {
      const end = new Date(now.getTime() - (count - 1 - i) * 7 * DAY);
      const start = new Date(end.getTime() - 6 * DAY);
      return {
        label: shortDate(start),
        title: `${longDate(start)} – ${longDate(end)}`,
        cents: 0,
        orders: 0,
      };
    });
    for (const order of counted) {
      const weeksAgo = Math.floor(
        (now.getTime() - order.createdAt.getTime()) / (7 * DAY),
      );
      const bucket = buckets[count - 1 - weeksAgo];
      if (bucket) {
        bucket.cents += order.totalCents;
        bucket.orders += 1;
      }
    }
    return buckets;
  }

  const buckets = new Map<string, Bucket>();
  const cursor = new Date(from.getFullYear(), from.getMonth(), 15);
  while (monthKey(cursor) <= monthKey(now)) {
    buckets.set(monthKey(cursor), {
      label: cursor.toLocaleDateString("pl-PL", { month: "short" }),
      title: cursor.toLocaleDateString("pl-PL", {
        month: "long",
        year: "numeric",
      }),
      cents: 0,
      orders: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  for (const order of counted) {
    const bucket = buckets.get(monthKey(order.createdAt));
    if (bucket) {
      bucket.cents += order.totalCents;
      bucket.orders += 1;
    }
  }
  return [...buckets.values()];
}

/**
 * Konta klientów. Tabela User powstała później niż reszta, więc przed
 * migracją jej nie ma — wtedy zwracamy null, a panel mówi, co zrobić.
 */
async function accountStats(from: Date | null, previousFrom: Date | null) {
  try {
    const [total, created, createdBefore, active, byProvider] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: from ? { createdAt: { gte: from } } : {} }),
        from && previousFrom
          ? prisma.user.count({
              where: { createdAt: { gte: previousFrom, lt: from } },
            })
          : Promise.resolve(null),
        prisma.user.count({
          where: from ? { lastLoginAt: { gte: from } } : {},
        }),
        prisma.user.groupBy({ by: ["provider"], _count: true }),
      ]);
    return {
      total,
      created,
      createdBefore,
      active,
      byProvider: byProvider
        .map((row) => ({ provider: row.provider, count: row._count }))
        .sort((a, b) => b.count - a.count),
    };
  } catch {
    return null;
  }
}

export async function getDashboardStats(period: PeriodKey) {
  const now = new Date();
  const { days } = PERIODS[period];
  const from = days ? new Date(now.getTime() - days * DAY) : null;
  // Dla porównania „vs poprzedni okres” pobieramy od razu dwa okresy wstecz.
  const fetchFrom = days ? new Date(now.getTime() - 2 * days * DAY) : null;

  const [allOrders, lowStock, accounts] = await Promise.all([
    fetchOrders(fetchFrom),
    prisma.productVariant.findMany({
      where: { stock: { lte: LOW_STOCK } },
      include: { product: { select: { id: true, title: true } } },
      orderBy: [{ stock: "asc" }, { product: { title: "asc" } }],
    }),
    accountStats(from, fetchFrom),
  ]);

  const current = from
    ? allOrders.filter((o) => o.createdAt >= from)
    : allOrders;
  const previous = from
    ? allOrders.filter((o) => o.createdAt < from)
    : null;

  const byStatus = Object.fromEntries(
    ORDER_STATUSES.map((status) => [
      status,
      current.filter(
        (o) => o.status === status && o.paymentStatus === "oplacone",
      ).length,
    ]),
  ) as Record<(typeof ORDER_STATUSES)[number], number>;

  // Grupujemy po nazwie, nie po slugu — slug produktu bywał zmieniany, a w
  // zamówieniu zostaje ten z chwili zakupu, więc jedna rzecz liczyłaby się dwa razy.
  const products = new Map<
    string,
    { title: string; image: string; units: number; cents: number }
  >();
  for (const order of current.filter(counts)) {
    for (const item of order.items) {
      const entry = products.get(item.title) ?? {
        title: item.title,
        image: item.image,
        units: 0,
        cents: 0,
      };
      entry.units += item.quantity;
      entry.cents += item.priceCents * item.quantity;
      products.set(item.title, entry);
    }
  }
  const topProducts = [...products.values()]
    .sort((a, b) => b.units - a.units || b.cents - a.cents)
    .slice(0, 5);

  const counted = current.filter(counts);

  return {
    accounts: accounts && {
      ...accounts,
      ordersFromAccounts: counted.filter((o) => o.userId).length,
      ordersAsGuest: counted.filter((o) => !o.userId).length,
    },
    current: totals(current),
    previous: previous ? totals(previous) : null,
    pendingPayments: current.filter((o) => o.paymentStatus === "oczekuje")
      .length,
    failedPayments: current.filter((o) => o.paymentStatus === "nieudane")
      .length,
    byStatus,
    // „Całość” zawsze w miesiącach, od pierwszego zamówienia.
    series: buildSeries(
      current,
      from ?? current[0]?.createdAt ?? now,
      now,
      days ?? 366,
    ),
    topProducts,
    lowStock: lowStock.sort(
      (a, b) =>
        a.stock - b.stock ||
        a.product.title.localeCompare(b.product.title, "pl") ||
        compareSizes(a.size, b.size),
    ),
    recentOrders: [...current].reverse().slice(0, 5),
  };
}
