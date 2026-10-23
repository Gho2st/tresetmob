import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/cart";
import { ORDER_STATUSES } from "@/lib/order-status";
import {
  PERIODS,
  getDashboardStats,
  isPeriodKey,
  type Bucket,
  type PeriodKey,
} from "@/lib/stats";

type Props = { searchParams: Promise<{ okres?: string }> };

export default async function AdminPodsumowanie({ searchParams }: Props) {
  const { okres } = await searchParams;
  const period: PeriodKey = isPeriodKey(okres) ? okres : "30";
  const stats = await getDashboardStats(period);
  const { current, previous } = stats;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl tracking-tight uppercase sm:text-4xl">
          Podsumowanie
        </h1>
        <nav
          aria-label="Okres"
          className="flex flex-wrap border border-black/15 text-xs tracking-widest uppercase"
        >
          {(Object.keys(PERIODS) as PeriodKey[]).map((key) => (
            <Link
              key={key}
              href={key === "30" ? "/admin" : `/admin?okres=${key}`}
              aria-current={key === period ? "page" : undefined}
              className={`px-3 py-2 transition-colors ${
                key === period
                  ? "bg-black text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              {PERIODS[key].label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ---------- liczby ---------- */}
      <section className="grid grid-cols-2 border-t border-l border-black/10 lg:grid-cols-4">
        <Stat
          label="Przychód"
          value={formatPrice(current.revenueCents)}
          now={current.revenueCents}
          before={previous?.revenueCents}
        />
        <Stat
          label="Zamówienia"
          value={String(current.orders)}
          now={current.orders}
          before={previous?.orders}
        />
        <Stat
          label="Średnie zamówienie"
          value={formatPrice(current.avgCents)}
          now={current.avgCents}
          before={previous?.avgCents}
        />
        <Stat
          label="Sprzedane sztuki"
          value={String(current.units)}
          now={current.units}
          before={previous?.units}
        />
      </section>

      {(current.discountCents > 0 ||
        stats.pendingPayments > 0 ||
        stats.failedPayments > 0) && (
        <p className="-mt-6 flex flex-wrap gap-x-6 gap-y-1 text-xs text-black/45">
          {current.discountCents > 0 && (
            <span>Udzielone rabaty: {formatPrice(current.discountCents)}</span>
          )}
          {stats.pendingPayments > 0 && (
            <span className="text-amber-700">
              Oczekuje na płatność: {stats.pendingPayments}
            </span>
          )}
          {stats.failedPayments > 0 && (
            <span className="text-red-700">
              Nieudane płatności: {stats.failedPayments}
            </span>
          )}
        </p>
      )}

      {/* ---------- konta ---------- */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Konta klientów</SectionTitle>
        {stats.accounts ? (
          <div className="grid grid-cols-2 border-t border-l border-black/10 lg:grid-cols-4">
            <Stat
              label="Konta łącznie"
              value={String(stats.accounts.total)}
              now={stats.accounts.total}
              note={
                stats.accounts.byProvider.length > 0
                  ? stats.accounts.byProvider
                      .map(
                        (p) =>
                          `${PROVIDERS[p.provider] ?? p.provider} ${p.count}`,
                      )
                      .join(" · ")
                  : "Jeszcze nikt się nie zalogował"
              }
            />
            <Stat
              label="Nowe konta"
              value={String(stats.accounts.created)}
              now={stats.accounts.created}
              before={stats.accounts.createdBefore ?? undefined}
            />
            <Stat
              label="Zalogowani w okresie"
              value={String(stats.accounts.active)}
              now={stats.accounts.active}
            />
            <Stat
              label="Zamówienia z konta"
              value={`${stats.accounts.ordersFromAccounts} / ${current.orders}`}
              now={stats.accounts.ordersFromAccounts}
              note={
                current.orders > 0
                  ? `${Math.round(
                      (stats.accounts.ordersFromAccounts / current.orders) *
                        100,
                    )}% · jako gość: ${stats.accounts.ordersAsGuest}`
                  : "Brak opłaconych zamówień"
              }
            />
          </div>
        ) : (
          <Empty>
            Brak tabeli kont w bazie — uruchom migrację{" "}
            <code className="text-black">npx prisma migrate deploy</code>.
          </Empty>
        )}
      </section>

      {/* ---------- wykres ---------- */}
      <section className="flex flex-col gap-4">
        <SectionTitle>Przychód w czasie</SectionTitle>
        <RevenueChart buckets={stats.series} />
      </section>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* ---------- statusy ---------- */}
        <section className="flex flex-col gap-4">
          <SectionTitle href="/admin/zamowienia">Statusy zamówień</SectionTitle>
          <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
            {ORDER_STATUSES.map((status) => {
              const count = stats.byStatus[status];
              const max = Math.max(...Object.values(stats.byStatus), 1);
              return (
                <li
                  key={status}
                  className="flex items-center gap-4 py-2.5 text-sm"
                >
                  <span className="w-28 shrink-0 first-letter:uppercase">
                    {status}
                  </span>
                  <span className="h-1.5 flex-1 bg-black/5">
                    <span
                      className="block h-full bg-black"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-8 text-right tabular-nums">{count}</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------- bestsellery ---------- */}
        <section className="flex flex-col gap-4">
          <SectionTitle href="/admin/produkty">
            Najlepiej się sprzedają
          </SectionTitle>
          {stats.topProducts.length === 0 ? (
            <Empty>Brak sprzedaży w tym okresie.</Empty>
          ) : (
            <ol className="flex flex-col divide-y divide-black/10 border-y border-black/10">
              {stats.topProducts.map((product, i) => (
                <li
                  key={product.title}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="w-4 text-xs text-black/35 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden bg-neutral-100">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-contain"
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {product.title}
                  </span>
                  <span className="text-right text-xs text-black/45 tabular-nums">
                    {product.units} szt.
                    <br />
                    <span className="text-sm text-black">
                      {formatPrice(product.cents)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* ---------- ostatnie zamówienia ---------- */}
        <section className="flex flex-col gap-4">
          <SectionTitle href="/admin/zamowienia">
            Ostatnie zamówienia
          </SectionTitle>
          {stats.recentOrders.length === 0 ? (
            <Empty>Brak zamówień w tym okresie.</Empty>
          ) : (
            <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
              {stats.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="font-semibold tracking-wide uppercase">
                      {order.number}
                    </span>
                    <span className="truncate text-xs text-black/45">
                      {order.customerName} ·{" "}
                      {order.createdAt.toLocaleDateString("pl-PL", {
                        timeZone: "Europe/Warsaw",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {order.status}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 tabular-nums ${
                      order.status === "anulowane" ||
                      order.paymentStatus !== "oplacone"
                        ? "text-black/35 line-through"
                        : ""
                    }`}
                  >
                    {formatPrice(order.totalCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------- stany magazynowe ---------- */}
        <section className="flex flex-col gap-4">
          <SectionTitle href="/admin/produkty">
            Kończy się na magazynie
          </SectionTitle>
          {stats.lowStock.length === 0 ? (
            <Empty>Wszystkie rozmiary mają po kilka sztuk.</Empty>
          ) : (
            <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
              {stats.lowStock.slice(0, 8).map((variant) => (
                <li key={variant.id}>
                  <Link
                    href={`/admin/produkty/${variant.product.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-black/[0.03]"
                  >
                    <span className="min-w-0 truncate">
                      {variant.product.title}{" "}
                      <span className="text-black/45">· {variant.size}</span>
                    </span>
                    <span
                      className={`shrink-0 text-xs tracking-widest uppercase ${
                        variant.stock === 0 ? "text-red-700" : "text-amber-700"
                      }`}
                    >
                      {variant.stock === 0 ? "Brak" : `${variant.stock} szt.`}
                    </span>
                  </Link>
                </li>
              ))}
              {stats.lowStock.length > 8 && (
                <li className="py-2.5 text-xs text-black/45">
                  …i jeszcze {stats.lowStock.length - 8}
                </li>
              )}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

const PROVIDERS: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  nieznany: "inne",
};

function SectionTitle({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-xs tracking-widest text-black/55 uppercase">
        {children}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-xs tracking-widest text-black/40 uppercase hover:text-black"
        >
          Wszystkie →
        </Link>
      )}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-y border-black/10 py-6 text-sm text-black/45">
      {children}
    </p>
  );
}

function Stat({
  label,
  value,
  now,
  before,
  note,
}: {
  label: string;
  value: string;
  now: number;
  before?: number;
  /** dopisek zamiast porównania z poprzednim okresem */
  note?: string;
}) {
  let delta: React.ReactNode = note ? (
    <span className="text-black/45">{note}</span>
  ) : null;
  if (!note && before !== undefined) {
    if (before === 0) {
      delta =
        now > 0 ? (
          <span className="text-black/45">nowość w okresie</span>
        ) : null;
    } else {
      const pct = Math.round(((now - before) / before) * 100);
      delta =
        pct === 0 ? (
          <span className="text-black/45">bez zmian</span>
        ) : (
          <span className={pct > 0 ? "text-green-700" : "text-red-700"}>
            {pct > 0 ? "▲" : "▼"} {Math.abs(pct)}%{" "}
            <span className="text-black/40">vs poprzedni okres</span>
          </span>
        );
    }
  }

  return (
    <div className="flex flex-col gap-2 border-r border-b border-black/10 p-4 sm:p-5">
      <span className="text-[0.68rem] tracking-widest text-black/50 uppercase">
        {label}
      </span>
      <span className="font-display text-2xl tracking-tight tabular-nums sm:text-3xl">
        {value}
      </span>
      <span className="min-h-4 text-xs">{delta}</span>
    </div>
  );
}

/** „Ładny” sufit osi — 1, 2, 2,5 lub 5 razy potęga dziesięciu. */
function niceCeil(value: number) {
  if (value <= 0) return 100_00;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}

function RevenueChart({ buckets }: { buckets: Bucket[] }) {
  const max = niceCeil(Math.max(...buckets.map((b) => b.cents), 0));
  // Podpisów osi X nie dajemy pod każdym słupkiem — przy 30 dniach by się zlały.
  const every = Math.ceil(buckets.length / 8);
  const axisLabel = (cents: number) =>
    `${Math.round(cents / 100).toLocaleString("pl-PL")} zł`;

  return (
    <figure className="m-0 flex flex-col gap-3">
      <div className="flex gap-3">
        {/* oś Y — tylko sufit, połowa i zero, siatka jest pomocą, nie treścią */}
        <div className="relative w-16 shrink-0 text-right text-[0.65rem] text-black/40 tabular-nums">
          <span className="absolute top-0 right-0 -translate-y-1/2">
            {axisLabel(max)}
          </span>
          <span className="absolute top-1/2 right-0 -translate-y-1/2">
            {axisLabel(max / 2)}
          </span>
          <span className="absolute bottom-0 right-0 translate-y-1/2">
            0 zł
          </span>
        </div>

        <div className="relative h-52 flex-1">
          <div
            aria-hidden="true"
            className="absolute inset-0 flex flex-col justify-between"
          >
            <span className="border-t border-black/[0.07]" />
            <span className="border-t border-black/[0.07]" />
            <span className="border-t border-black/25" />
          </div>

          <div className="absolute inset-0 flex items-end gap-[2px]">
            {buckets.map((bucket, i) => (
              <div
                key={i}
                tabIndex={0}
                aria-label={`${bucket.title}: ${formatPrice(bucket.cents)}, zamówień ${bucket.orders}`}
                className="group relative flex h-full min-w-0 flex-1 items-end outline-none"
              >
                <div
                  className={`w-full rounded-t-[4px] transition-colors ${
                    bucket.cents > 0
                      ? "bg-black group-hover:bg-black/70 group-focus-visible:bg-black/70"
                      : ""
                  }`}
                  style={{ height: `${(bucket.cents / max) * 100}%` }}
                />
                <div
                  role="tooltip"
                  className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max max-w-56 flex-col gap-0.5 bg-black px-3 py-2 text-xs text-white shadow-lg group-hover:flex group-focus-visible:flex ${
                    i < buckets.length / 2 ? "left-0" : "right-0"
                  }`}
                >
                  <span className="text-white/60">{bucket.title}</span>
                  <span className="font-semibold tabular-nums">
                    {formatPrice(bucket.cents)}
                  </span>
                  <span className="text-white/60">
                    {bucket.orders}{" "}
                    {bucket.orders === 1
                      ? "zamówienie"
                      : bucket.orders % 10 >= 2 &&
                          bucket.orders % 10 <= 4 &&
                          (bucket.orders % 100 < 12 || bucket.orders % 100 > 14)
                        ? "zamówienia"
                        : "zamówień"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ml-[76px] flex gap-[2px] text-[0.65rem] text-black/40">
        {buckets.map((bucket, i) => (
          <span
            key={i}
            // na telefonie co drugi podpis znika, inaczej daty wchodzą na siebie
            className={`min-w-0 flex-1 overflow-visible whitespace-nowrap ${
              (i / every) % 2 === 1 ? "max-sm:invisible" : ""
            }`}
          >
            {i % every === 0 ? bucket.label : ""}
          </span>
        ))}
      </div>

      <details className="text-xs text-black/50">
        <summary className="cursor-pointer select-none hover:text-black">
          Pokaż jako tabelę
        </summary>
        <table className="mt-3 w-full text-left text-sm text-black">
          <thead className="text-xs text-black/45">
            <tr>
              <th className="py-1 font-normal">Okres</th>
              <th className="py-1 text-right font-normal">Zamówienia</th>
              <th className="py-1 text-right font-normal">Przychód</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {buckets.map((bucket, i) => (
              <tr key={i}>
                <td className="py-1">{bucket.title}</td>
                <td className="py-1 text-right tabular-nums">
                  {bucket.orders}
                </td>
                <td className="py-1 text-right tabular-nums">
                  {formatPrice(bucket.cents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
