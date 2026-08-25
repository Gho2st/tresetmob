import Image from "next/image";
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/lib/cart";
import OrderStatusSelect from "./OrderStatusSelect";

export default async function AdminZamowienia() {
  const orders = await getAllOrders();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bebas text-4xl uppercase tracking-tight">
          Zamówienia
        </h1>
        <span className="text-sm text-black/40">{orders.length} zamówień</span>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-black/50">Brak zamówień.</p>
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
                    {order.createdAt.toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </div>

              <div className="flex flex-wrap gap-6 text-xs text-black/50">
                <span>
                  {order.customerName} · {order.customerEmail} · {order.phone}
                </span>
                <span>
                  {order.deliveryMethod === "paczkomat"
                    ? `Paczkomat ${order.inpostPoint}`
                    : [order.address, order.postalCode, order.city]
                        .filter(Boolean)
                        .join(", ")}
                </span>
                <span>{order.paymentMethod}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-14 w-14 shrink-0 overflow-hidden bg-neutral-100"
                    title={`${item.title} (${item.size}) × ${item.quantity}`}
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>

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
