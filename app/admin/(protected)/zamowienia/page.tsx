import Image from "next/image";
import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/cart";
import OrderStatusSelect from "./OrderStatusSelect";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const PAYMENT_BADGE: Record<string, { label: string; className: string }> = {
  oplacone: { label: "Opłacone", className: "border-emerald-700/40 bg-emerald-50 text-emerald-800" },
  oczekuje: { label: "Oczekuje na płatność", className: "border-amber-600/40 bg-amber-50 text-amber-800" },
  nieudane: { label: "Płatność nieudana", className: "border-red-700/40 bg-red-50 text-red-800" },
  porzucone: { label: "Porzucone", className: "border-black/15 bg-black/5 text-black/50" },
};

// Domyślnie widać to, czym trzeba się zająć — opłacone. Porzucone i nieudane
// próby płatności leżą w osobnej zakładce, jak w WooCommerce czy Shopify.
const TABS = [
  { key: "oplacone", label: "Opłacone", statuses: ["oplacone"] },
  { key: "oczekuje", label: "Oczekujące", statuses: ["oczekuje"] },
  { key: "porzucone", label: "Porzucone i nieudane", statuses: ["porzucone", "nieudane"] },
  { key: "wszystkie", label: "Wszystkie", statuses: null },
] as const;

type Props = { searchParams: Promise<{ platnosc?: string }> };

export default async function AdminZamowienia({ searchParams }: Props) {
  const { platnosc } = await searchParams;
  const allOrders = await getAllOrders();
  const tab = TABS.find((t) => t.key === platnosc) ?? TABS[0];

  const inTab = (t: (typeof TABS)[number]) =>
    t.statuses === null
      ? allOrders
      : allOrders.filter((o) => (t.statuses as readonly string[]).includes(o.paymentStatus));
  const orders = inTab(tab);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Zamówienia" />

      <nav aria-label="Status płatności" className="-mt-2 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = t.key === tab.key;
          return (
            <Link
              key={t.key}
              href={t.key === TABS[0].key ? "/admin/zamowienia" : `/admin/zamowienia?platnosc=${t.key}`}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 border px-3 py-1.5 text-xs tracking-widest uppercase transition-colors ${
                active
                  ? "border-black bg-black text-white"
                  : "border-black/15 text-black/60 hover:border-black hover:text-black"
              }`}
            >
              {t.label}
              <span className={active ? "text-white/60" : "text-black/35"}>
                {inTab(t).length}
              </span>
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <p className="text-sm text-black/50">Brak zamówień w tej zakładce.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-col gap-4 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-sm font-semibold tracking-wide uppercase">
                    {order.number}
                  </span>
                  <span className="text-xs text-black/40">
                    {order.createdAt.toLocaleString("pl-PL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Warsaw",
                    })}
                  </span>
                  {PAYMENT_BADGE[order.paymentStatus] && (
                    <span
                      className={`border px-2 py-0.5 text-[10px] tracking-widest uppercase ${PAYMENT_BADGE[order.paymentStatus].className}`}
                    >
                      {PAYMENT_BADGE[order.paymentStatus].label}
                    </span>
                  )}
                </div>
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </div>

              <div className="flex flex-col gap-1 text-xs text-black/50 sm:flex-row sm:flex-wrap sm:gap-x-6">
                <span className="break-words">
                  {order.customerName} · {order.customerEmail} · {order.phone}
                </span>
                <span>
                  {order.deliveryMethod === "paczkomat"
                    ? `Paczkomat ${order.inpostPoint}`
                    : [order.address, order.postalCode, order.city]
                        .filter(Boolean)
                        .join(", ")}
                </span>
                {order.companyName && (
                  <span className="text-black/70">
                    Faktura: {order.companyName} · NIP {order.companyNip} ·{" "}
                    {order.companyAddress}
                  </span>
                )}
                <span>
                  {order.paymentMethod}
                  {order.paymentRef && <> · {order.paymentRef}</>}
                </span>
              </div>

              <ul className="flex flex-wrap gap-3 sm:gap-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 border border-black/10 p-2 pr-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-neutral-100">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                    <span className="flex flex-col text-xs">
                      <span className="max-w-[22ch] truncate font-semibold uppercase">
                        {item.title}
                      </span>
                      <span className="text-black/50">
                        {item.size} · {item.quantity} × {formatPrice(item.priceCents)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between text-sm">
                <span className="text-black/40">
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)} szt.
                  {order.discountCents > 0 && (
                    <> · rabat {formatPrice(order.discountCents)}</>
                  )}
                </span>
                <span className="font-semibold">
                  {formatPrice(order.totalCents)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
